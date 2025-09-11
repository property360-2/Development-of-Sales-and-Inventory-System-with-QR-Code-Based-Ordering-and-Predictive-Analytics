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
            $customerName = $payment->order->customer->customer_name ?? 'Unknown';
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Created Payment of ₱' . $payment->amount_paid .
                    ' for Customer: ' . $customerName,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($payment) {
            $changes = collect($payment->getChanges())->except(['updated_at']);
            $customerName = $payment->order->customer->customer_name ?? 'Unknown';
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Updated Payment for Customer: ' . $customerName .
                    ' | Changes: ' . json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($payment) {
            $customerName = $payment->order->customer->customer_name ?? 'Unknown';
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Payment for Customer: ' . $customerName,
                'timestamp' => now(),
            ]);
        });
    }
}
