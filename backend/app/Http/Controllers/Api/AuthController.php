<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->active) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé.'],
            ]);
        }

        $expirationHours = (int) env('SANCTUM_TOKEN_EXPIRATION_HOURS', 8);
        $expiresAt = now()->addHours($expirationHours);

        $accessToken = $user->createToken('api', ['*'], $expiresAt);

        return response()->json([
            'token' => $accessToken->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
            'expires_in' => $expirationHours * 3600,
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
}
