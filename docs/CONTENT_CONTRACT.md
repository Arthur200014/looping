# Content contract — черновик B

Будущий формат: versioned JSON/TS objects, только данные и identifiers, без HTML-фрагментов от внешнего ученика и eval.

```json
{
  "schemaVersion": 1,
  "exam": "OGE_MATH",
  "taskNumber": 13,
  "module": "guide",
  "themeId": "interval-patrol-original-art",
  "chapters": [
    {
      "chapterIndex": 0,
      "id": "intro",
      "stations": [
        {
          "stationId": "sign-test",
          "mechanicId": "guided-step",
          "skillIds": ["inequalities.sign-chart"],
          "promptTex": "x^2-4>0",
          "hints": ["Найдите нули выражения."],
          "source": {"kind": "author", "label": "Авторский демонстрационный пример"}
        }
      ]
    }
  ]
}
```

Это только схема-пример (не утверждённый готовый экзаменационный прототип и не опубликованная задача). Данные ожидаемых ответов, варианты, решение, визуальная геометрия и scoring rubric должны иметь собственную versioned-структуру со schema validation. Не разрешать произвольные `<script>` в content.
