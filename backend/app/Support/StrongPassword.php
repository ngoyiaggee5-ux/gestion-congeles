<?php

namespace App\Support;

class StrongPassword
{
    public const RULE = 'required|string|min:8|regex:/^(?=.*[A-Za-z])(?=.*\d).+$/';

    public const RULE_OPTIONAL = 'nullable|string|min:8|regex:/^(?=.*[A-Za-z])(?=.*\d).+$/';

    public const MESSAGE = 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.';
}
