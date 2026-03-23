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
- В `/admin` есть отдельная панель для роликов главной страницы и единый блок управления библиотекой.
- Внутри него можно редактировать названия блоков, добавлять новые блоки и уроки, менять описания уроков и видео, прописывать тайм-коды и видеть оценки роликов.
- Для каждого урока можно загружать видео и PDF-файлы в Supabase Storage bucket `videos` (или bucket из `VITE_SUPABASE_VIDEOS_BUCKET`).
- Также в админке отображаются комментарии пользователей, которые уже посмотрели урок.
