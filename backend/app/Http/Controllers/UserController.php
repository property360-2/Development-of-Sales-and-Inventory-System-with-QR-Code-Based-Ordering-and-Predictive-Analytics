<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Store\StoreUserRequest;
use App\Http\Requests\Update\UpdateUserRequest;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index()
    {
        $users = User::select('user_id', 'name','role', 'created_at')
            ->paginate(20);

        $userId = Auth::id();
        if ($userId) {
            AuditLog::create([
                'user_id' => $userId,
                'action' => 'Viewed all users',
                'timestamp' => now(),
            ]);
        }

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::select('user_id', 'name','role', 'created_at')
            ->findOrFail($id);

        $userId = Auth::id();
        if ($userId) {
            AuditLog::create([
                'user_id' => $userId,
                'action' => 'Viewed User ID: ' . $user->user_id,
                'timestamp' => now(),
            ]);
        }

        return response()->json($user);
    }

    /**
     * Store a newly created user.
     * No need for audit log here since model handles 'created'.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($user, 201);
    }

    /**
     * Display a specific user.
     */


    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);

        return response()->json($user);
    }

    /**
     * Remove a user from the database.
     * No audit log here; model handles 'deleted'.
     */
    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(null, 204);
    }
}
