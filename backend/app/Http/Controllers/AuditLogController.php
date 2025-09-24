<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    /**
     * Display a listing of all audit logs with related user info.
     */
    public function index(Request $request)
    {
        $logs = AuditLog::with('user:user_id,name,role') // fixed PK
            ->select('log_id', 'user_id', 'action', 'timestamp')
            ->get(); // fetch all records, no pagination

        return response()->json($logs);
    }

    /**
     * Display a specific audit log entry with related user info.
     */
    public function show($id)
    {
        $log = AuditLog::with('user:user_id,name,role') // fixed PK
            ->select('log_id', 'user_id', 'action', 'timestamp')
            ->findOrFail($id);

        return response()->json($log);
    }
}
