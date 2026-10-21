# Quality gates — не сокращать

## До допуска ядра к масштабированию
1. **Contract**: schema guard, event dedup/revision ordering, teacher-only navigation, chapter 0, snapshot/reconnect, independent personal answers, reset semantics.
2. **Lifecycle**: после ≥100 переключений число active subscriptions и listeners не растёт; dispose освобождает события, timers, rAF, audio.
3. **Board**: реально удаляет пересечённый stroke по ID; корректно работает при масштабировании/zoom, Ctrl/Cmd+Z и локальном input undo; double-delete/clear race безопасен.
4. **Math**: property cases для каждого генератора, примеры/контрпримеры, корректные интервалы и знаки; MathJax не оставляет необработанный TeX, дроби вертикальны.
5. **UI**: desktop/mobile, без horizontal overflow и перекрытия панелей, понятные focus/keyboard controls, screenshot mode.
6. **Realtime**: ДВА ИЗОЛИРОВАННЫХ браузерных контекста (разные storage identities), teacher → student latency/смена главы включая 0, поля и drag, board/eraser, reset, reconnection, adverse network. In-memory integration отдельно и не считается real e2e.
7. **Security/data**: actor role enforce на сервере, idempotent attempts, никакой prod конфигурации, только авторизованное сохранение.
8. **Independent review**: валидация математики и рисунков человеком/отдельным контролем до объявления VERIFIED.
9. **Source**: актуальная спецификация/критерии ФИПИ, зафиксированная дата URL и статус авторской задачи.

## Evidence
В `.ai/TEST_RESULTS.md` сохранять: command, environment, commit, output summary, PASS/FAIL/NOT_VERIFIED. Без доказательства статус НЕ повышать.

## Acceptance для номера
`gaid.html`, `dz1.html`, `dz2.html`, `checklist.html`, 1+ механика/игра по смыслу, проверенные ответы и решения, 2-client sync, доступность/UX, источники и итоговые статусы. Дополнительные ДЗ — по потребности, число не самоцель.
