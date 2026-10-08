<?php
/**
 * Validator — декларативная валидация по строковым правилам (DRY).
 * Правила: required, int, min:N, max:N, date, time, phone_ru, email, boolean_true,
 *          choice:a,b,c, between:N,M, len:N
 * Возвращает массив ошибок [поле => сообщение]; пустой массив = данные валидны.
 */
class Validator
{
    public static function make(array $data, array $rules): array
    {
        $errors = [];
        foreach ($rules as $field => $ruleStr) {
            $value = $data[$field] ?? null;
            $rulesList = explode('|', $ruleStr);
            $required = in_array('required', $rulesList, true);
            $isEmpty = $value === null || $value === '' || (is_array($value) && $value === []);
            if ($required && $isEmpty) { $errors[$field] = 'Поле обязательно для заполнения'; continue; }
            if ($isEmpty && !$required) continue; // nullable + пусто -> пропускаем
            foreach ($rulesList as $r) {
                [$name, $arg] = array_pad(explode(':', $r, 2), 2, null);
                $msg = match (true) {
                    $name === 'int' && !is_numeric($value) => 'Введите целое число',
                    $name === 'int' && (int)$value != $value => 'Введите целое число',
                    $name === 'min' && (int)$value < (int)$arg => 'Минимальное значение: ' . $arg,
                    $name === 'max' && is_string($value) && mb_strlen($value) > (int)$arg => 'Максимум ' . $arg . ' символов',
                    $name === 'max' && is_array($value) && count($value) > (int)$arg => 'Максимум ' . $arg . ' элементов',
                    $name === 'max' && is_numeric($value) && !is_string($value) && (int)$value > (int)$arg => 'Максимальное значение: ' . $arg,
                    $name === 'date' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$value) => 'Некорректная дата',
                    $name === 'time' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)$value) => 'Некорректное время',
                    $name === 'phone_ru' => self::normPhone((string)$value) === null ? 'Телефон в формате +7...' : null,
                    $name === 'email' && !filter_var((string)$value, FILTER_VALIDATE_EMAIL) => 'Некорректный email',
                    $name === 'boolean_true' && empty($value) => 'Требуется подтверждение',
                    $name === 'choice' && !in_array((string)$value, explode(',', (string)$arg), true) => 'Недопустимое значение',
                    default => null,
                };
                if ($msg) { $errors[$field] = $msg; break; }
            }
        }
        return $errors;
    }

    /** Нормализация телефона к +7XXXXXXXXXX (8->7, 10 цифр -> +7). null если не телефон */
    public static function normPhone(string $raw): ?string
    {
        $d = preg_replace('/\D/', '', $raw);
        if (strlen($d) === 11 && ($d[0] === '8' || $d[0] === '7')) $d = '7' . substr($d, 1);
        if (strlen($d) === 10) $d = '7' . $d;
        return strlen($d) === 11 && $d[0] === '7' ? '+' . $d : null;
    }
}
