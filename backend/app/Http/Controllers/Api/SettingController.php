<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show()
    {
        return response()->json(Setting::getAppSettings());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'font' => 'nullable|in:dm-sans,outfit,system,serif',
            'theme' => 'nullable|in:light,dark',
            'currency' => 'nullable|in:CDF,USD',
            'usdRate' => 'nullable|integer|min:1',
        ]);

        $settings = Setting::saveAppSettings($data);

        return response()->json($settings);
    }
}
