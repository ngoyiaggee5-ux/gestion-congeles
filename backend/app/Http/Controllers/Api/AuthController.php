<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private const LOCKOUT_SECONDS = 900;

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($data['email']));
        $key = $this->throttleKey($email, $request->ip());

        if ($this->rateLimitEnabled()) {
            if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
                $seconds = RateLimiter::availableIn($key);
                $minutes = max(1, (int) ceil($seconds / 60));

                throw ValidationException::withMessages([
                    'email' => ["Trop de tentatives. Compte temporairement bloqué — réessayez dans {$minutes} min."],
                ]);
            }
        }

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            if ($this->rateLimitEnabled()) {
                RateLimiter::hit($key, self::LOCKOUT_SECONDS);
                $remaining = self::MAX_ATTEMPTS - RateLimiter::attempts($key);

                $message = $remaining > 0
                    ? "Identifiants incorrects. {$remaining} tentative(s) restante(s)."
                    : 'Trop de tentatives. Compte temporairement bloqué — réessayez dans 15 min.';
            } else {
                $message = 'Identifiants incorrects.';
            }

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }

        if (! $user->active) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé.'],
            ]);
        }

        if ($this->rateLimitEnabled()) {
            RateLimiter::clear($key);
        }

        $expirationHours = (int) env('SANCTUM_TOKEN_EXPIRATION_HOURS', 8);
        $expiresAt = now()->addHours($expirationHours);

        try {
            $accessToken = $user->createToken('api', ['*'], $expiresAt);
        } catch (\Throwable $e) {
            Log::warning('createToken with expiry failed, fallback without expiry', [
                'error' => $e->getMessage(),
            ]);
            $accessToken = $user->createToken('api');
            $expiresAt = null;
        }

        return response()->json([
            'token' => $accessToken->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt?->toIso8601String(),
            'expires_in' => $expiresAt ? $expirationHours * 3600 : null,
            'user' => $user->only(['id', 'name', 'email', 'role', 'active']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            ...$user->toArray(),
            'permissions' => \App\Support\Permissions::forRole($user->role),
        ]);
    }

    private function throttleKey(string $email, ?string $ip): string
    {
        return 'login:'.sha1($email.'|'.($ip ?? 'unknown'));
    }

    private function rateLimitEnabled(): bool
    {
        try {
            RateLimiter::attempts('__ping__');

            return true;
        } catch (\Throwable $e) {
            Log::warning('Rate limiter unavailable (cache?) — login without throttle', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
