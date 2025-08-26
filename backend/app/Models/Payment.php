<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $timestamps = true;

    protected $fillable = [
        'order_id',
        'amount_paid',
        'payment_method',
        'payment_status',
        'payment_timestamp',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    // ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($payment) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Created Payment ID: ' . $payment->payment_id . ' for Order ID: ' . $payment->order_id,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($payment) {
            $changes = $payment->getChanges();
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Updated Payment ID: ' . $payment->payment_id . ' | Changes: ' . json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($payment) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Payment ID: ' . $payment->payment_id,
                'timestamp' => now(),
            ]);
        });
    }
}
