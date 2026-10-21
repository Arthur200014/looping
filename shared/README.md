# Shared kernel (Stage B)

Здесь появится единый код UI, механик, состояния, доски, транспорта и валидаторов. Сейчас реализации нет — `NOT_STARTED`.

Предполагаемая последовательность: `core/RoomState` → reducer + in-memory transport → lifecycle → widgets/math → board → защищённый сетевой адаптер. Контракт и инварианты — `docs/ARCHITECTURE.md` и `.ai/PROJECT_SPEC.md`.
