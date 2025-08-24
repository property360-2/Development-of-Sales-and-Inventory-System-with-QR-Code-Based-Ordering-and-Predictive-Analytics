<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;

class AuditLogController extends Controller
{
    /**
     * Display a listing of all audit logs with related user info.
     */
    public function index()
    {
        $logs = AuditLog::with('user')->get();
        return response()->json($logs);
    }

    /**
     * Display a specific audit log entry with related user info.
     */
    public function show($id)
    {
        $log = AuditLog::with('user')->findOrFail($id);
        return response()->json($log);
    }
}
