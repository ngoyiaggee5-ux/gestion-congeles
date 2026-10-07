<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Support\DataSync;
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
            'email' => 'nullable|email|max:255|unique:clients,email',
            'type' => 'nullable|in:détail,gros',
            'address' => 'nullable|string|max:255',
        ]);

        if (empty($data['email'])) {
            $data['email'] = null;
        }

        $client = Client::create($data);
        DataSync::bump();

        return response()->json($client, 201);
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
            'email' => 'nullable|email|max:255|unique:clients,email,'.$client->id,
            'type' => 'nullable|in:détail,gros',
            'address' => 'nullable|string|max:255',
        ]);

        if (array_key_exists('email', $data) && empty($data['email'])) {
            $data['email'] = null;
        }

        $client->update($data);
        DataSync::bump();

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        DataSync::bump();

        return response()->json(['message' => 'Client supprimé']);
    }
}
