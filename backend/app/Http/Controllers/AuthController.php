<?php
// backend/app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        // Log login action
        AuditLog::create([
            'user_id' => $user->user_id,
            'action' => 'Logged in',
            'timestamp' => now(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Logout user and revoke current token
     */
    public function logout(Request $request)
    {
        // Get authenticated user
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        // Log logout action before revoking token
        AuditLog::create([
            'user_id' => $user->user_id,
            'action' => 'Logged out',
            'timestamp' => now(),
        ]);

        // Delete current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }

    /**
     * Logout from all devices (revoke all tokens)
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        // Log logout action
        AuditLog::create([
            'user_id' => $user->user_id,
            'action' => 'Logged out from all devices',
            'timestamp' => now(),
        ]);

        // Delete all tokens for this user
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out from all devices'
        ], 200);
    }
}

// Add to backend/routes/api.php

// Logout routes (inside auth:sanctum middleware)
