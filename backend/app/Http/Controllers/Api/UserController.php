<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::orderBy('name')->get(['id', 'name', 'email', 'role', 'active', 'created_at']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:administrateur,vendeur,caissier',
        ]);

        $user = User::create([
            ...$data,
            'active' => true,
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return $user->only(['id', 'name', 'email', 'role', 'active', 'created_at']);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:administrateur,vendeur,caissier',
            'active' => 'sometimes|boolean',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'active']));
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
