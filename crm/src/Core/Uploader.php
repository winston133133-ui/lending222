<?php
/**
 * Uploader — загрузка изображений с адаптацией: через GD создаются варианты
 * 400/800/1600 px (для srcset на лендинге) + оригинал сохраняется в uploads/.
 * Проверки: MIME по содержимому (finfo), размер, безопасное имя файла.
 */
class Uploader
{
    private const MAX_SIZE = 8 * 1024 * 1024; // 8 МБ
    private const WIDTHS = [400, 800, 1600];
    private const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

    /** Возвращает ['path'=>'/uploads/x.webp','variants'=>[400=>...,800=>...]] или бросает RuntimeException */
    public static function image(array $file, string $subdir = 'misc'): array
    {
        if (($file['error'] ?? 1) !== UPLOAD_ERR_OK) throw new RuntimeException('Файл не загружен');
        if ($file['size'] > self::MAX_SIZE) throw new RuntimeException('Файл больше 8 МБ');
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!isset(self::TYPES[$mime])) throw new RuntimeException('Можно загружать только JPG/PNG/WEBP/GIF');

        $dir = self::dir($subdir);
        $name = date('Ymd-His') . '-' . bin2hex(random_bytes(4));
        $base = "$dir/$name";
        $ext = self::TYPES[$mime];
        $origPath = "$base.$ext";
        if (!move_uploaded_file($file['tmp_name'], $origPath)) throw new RuntimeException('Не удалось сохранить файл');

        $variants = [];
        if ($mime !== 'image/gif' && function_exists('imagecreatetruecolor')) {
            foreach (self::WIDTHS as $w) {
                $res = self::resize($origPath, $w, "$base-$w.webp");
                if ($res) $variants[$w] = "/uploads/$subdir/$name-$w.webp";
            }
        }
        return ['path' => "/uploads/$subdir/$name.$ext", 'variants' => $variants];
    }

    /** Превью-хелпер: img c srcset для адаптивных картинок лендинга/админки */
    public static function tag(string $url, string $alt, string $classes = ''): string
    {
        $srcset = '';
        foreach (self::WIDTHS as $w) {
            $v = preg_replace('/\.\w+$/', "-$w.webp", $url);
            if ($v !== $url && is_file(dirname(__DIR__, 2) . '/public' . $v)) $srcset .= ($srcset ? ', ' : '') . $v . " {$w}w";
        }
        return '<img src="' . e($url) . '" ' . ($srcset ? 'srcset="' . e($srcset) . '" sizes="(max-width:640px) 400px, 800px" ' : '')
             . 'alt="' . e($alt) . '" loading="lazy" class="' . e($classes) . '">';
    }

    private static function resize(string $src, int $width, string $dst): bool
    {
        $info = @getimagesize($src); if (!$info) return false;
        [$w, $h] = $info; if ($w <= $width) { $width = $w; }
        $img = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($src),
            IMAGETYPE_PNG  => @imagecreatefrompng($src),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($src) : false,
            default => false,
        };
        if (!$img) return false;
        $canvas = imagecreatetruecolor($width, (int)round($h * $width / $w));
        imagecopyresampled($canvas, $img, 0, 0, 0, 0, $width, imagesy($canvas), $w, $h);
        $ok = imagewebp($canvas, $dst, 85);
        imagedestroy($canvas); imagedestroy($img);
        return $ok;
    }

    private static function dir(string $sub): string
    {
        $dir = dirname(__DIR__, 2) . '/public/uploads/' . preg_replace('/[^a-z0-9_-]/i', '', $sub);
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        return $dir;
    }
}
