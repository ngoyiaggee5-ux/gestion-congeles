<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\DataSync;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => Permissions::normalizeRole($user->role),
            'active' => (bool) $user->active,
            'created_at' => $user->created_at,
        ];
    }

    public function index()
    {
        return User::orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'active', 'created_at'])
            ->map(fn (User $user) => $this->formatUser($user))
            ->values();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'role' => 'required|in:admin,manager,vendeur',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'active' => true,
        ]);

        DataSync::bump();

        return response()->json($this->formatUser($user), 201);
    }

    public function show(User $user)
    {
        return $this->formatUser($user);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'role' => 'sometimes|in:admin,manager,vendeur',
            'active' => 'sometimes|boolean',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        DataSync::bump();

        return response()->json($this->formatUser($user->fresh()));
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()?->id === $user->id) {
            abort(403, 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();
        DataSync::bump();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
