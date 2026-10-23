<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Memastikan pengguna sudah login dan role sesuai
        if (! $request->user() || $request->user()->role !== $role) {
            return response()->json([
                'message' => 'Akses ditolak. Endpoint ini hanya untuk peran ' . $role . '.'
            ], 403);
        }

        return $next($request);
    }
}
