<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'type' => 'nullable|in:détail,gros',
            'address' => 'nullable|string|max:255',
        ]);

        return response()->json(Client::create($data), 201);
    }

    public function show(Client $client)
    {
        return $client->load('sales');
    }

    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'type' => 'nullable|in:détail,gros',
            'address' => 'nullable|string|max:255',
        ]);

        $client->update($data);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json(['message' => 'Client supprimé']);
    }
}
