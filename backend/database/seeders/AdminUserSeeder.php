<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed satu user Admin.
     *
     * Email & password bisa dioverride lewat env ADMIN_EMAIL / ADMIN_PASSWORD
     * supaya tidak perlu commit kredensial ke kode.
     *
     * Jalankan di production:
     *   php artisan db:seed --class=AdminUserSeeder
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@tpq.local');
        $password = env('ADMIN_PASSWORD', 'admin123');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Administrator',
                'password' => Hash::make($password),
                'role' => 'Admin',
                'is_active' => true,
            ]
        );

        $this->command->info("Admin user siap: {$user->email}");
    }
}
