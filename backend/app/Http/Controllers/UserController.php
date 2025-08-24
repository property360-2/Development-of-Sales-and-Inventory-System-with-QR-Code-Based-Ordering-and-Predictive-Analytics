<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Admin,Cashier',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $data = $request->all();
        $data['password'] = Hash::make($data['password']); // hash password

        $user = User::create($data);
        return response()->json($user, 201);
    }

    /**
     * Display a specific user.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'username' => 'sometimes|string|max:50|unique:users,username,'.$id.',user_id',
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:Admin,Cashier',
            'contact_number' => 'sometimes|string|max:20',
        ]);

        $data = $request->all();

        // hash password if provided
        if(isset($data['password'])){
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return response()->json($user);
    }

    /**
     * Remove a user from the database.
     */
    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(null, 204);
    }
}
