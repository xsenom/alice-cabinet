# Видео для HomePage и Library

Положите видеофайлы на сервер в эту папку.

## HomePage
- `public/videos/how-to-use-lesik.mp4`
- `public/videos/who-needs-lesik.mp4`
- `public/videos/miniapp-pro.mp4`

## Library
- `public/videos/funnel-01.mp4`
- `public/videos/funnel-02.mp4`
- `public/videos/bot-01.mp4`
- `public/videos/ai-01.mp4`
- `public/videos/miniapp-01.mp4`

В продакшене это URL вида `/videos/<file>.mp4` с вашего сервера.

## Admin-панель
- В `/admin` появился экран загрузки роликов для текущих и будущих материалов.
- По умолчанию он отправляет файлы в Supabase Storage bucket `videos` (или в bucket из `VITE_SUPABASE_VIDEOS_BUCKET`).
- Текущие ролики загружаются с `upsert` в путь `public/<filename>`, поэтому можно перезаливать ролики под тем же именем.
- Для будущих роликов есть отдельная форма: можно указать название, выбрать или создать новую группу, обязательно задать доступ (`free` / `pro`) и получить путь вида `custom/<group>/<slug>.<ext>`.
