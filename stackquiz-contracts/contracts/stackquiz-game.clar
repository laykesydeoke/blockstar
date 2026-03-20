;; StackQuiz Game Contract
;; Version: 1.0.0
;; Clarity 3

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-host (err u100))
(define-constant err-game-exists (err u101))
(define-constant err-game-not-found (err u102))
(define-constant err-game-not-active (err u103))
(define-constant err-already-registered (err u104))
(define-constant err-insufficient-funds (err u105))
(define-constant err-already-finalized (err u106))
(define-constant err-invalid-winner (err u107))

;; Data Maps
(define-map games
  { game-id: (string-ascii 32) }
  {
    host: principal,
    total-prize: uint,
    first-prize: uint,
    second-prize: uint,
    third-prize: uint,
    status: (string-ascii 10),
    player-count: uint,
    created-at: uint
  }
)

(define-map players
  { game-id: (string-ascii 32), player: principal }
  {
    nickname: (string-ascii 20),
    registered-at: uint
  }
)

(define-map winners
  { game-id: (string-ascii 32) }
  {
    first: principal,
    second: principal,
    third: principal,
    distributed: bool
  }
)

;; Private Functions
(define-private (calculate-prizes (total uint))
  {
    first: (/ (* total u50) u100),
    second: (/ (* total u30) u100),
    third: (/ (* total u20) u100)
  }
)

;; Public Functions

;; Create a new game with prize pool
(define-public (create-game (game-id (string-ascii 32)) (total-prize uint))
  (let
    (
      (prizes (calculate-prizes total-prize))
    )
    (asserts! (is-none (map-get? games { game-id: game-id })) err-game-exists)
    (asserts! (>= total-prize u1000000) err-insufficient-funds) ;; Min 1 STX
    (try! (stx-transfer? total-prize tx-sender (as-contract tx-sender)))
    (map-set games
      { game-id: game-id }
      {
        host: tx-sender,
        total-prize: total-prize,
        first-prize: (get first prizes),
        second-prize: (get second prizes),
        third-prize: (get third prizes),
        status: "waiting",
        player-count: u0,
        created-at: stacks-block-height
      }
    )
    (ok game-id)
  )
)

;; Register a player for a game
(define-public (register-player (game-id (string-ascii 32)) (nickname (string-ascii 20)))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) err-game-not-found))
    )
    (asserts! (is-eq (get status game) "waiting") err-game-not-active)
    (asserts! (is-none (map-get? players { game-id: game-id, player: tx-sender })) err-already-registered)
    (map-set players
      { game-id: game-id, player: tx-sender }
      {
        nickname: nickname,
        registered-at: stacks-block-height
      }
    )
    (map-set games
      { game-id: game-id }
      (merge game { player-count: (+ (get player-count game) u1) })
    )
    (ok true)
  )
)

;; Finalize game and distribute prizes
(define-public (finalize-game
  (game-id (string-ascii 32))
  (first principal)
  (second principal)
  (third principal))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) err-game-not-found))
    )
    (asserts! (is-eq tx-sender (get host game)) err-not-host)
    (asserts! (is-eq (get status game) "waiting") err-game-not-active)
    (asserts! (is-some (map-get? players { game-id: game-id, player: first })) err-invalid-winner)
    (asserts! (is-some (map-get? players { game-id: game-id, player: second })) err-invalid-winner)
    (asserts! (is-some (map-get? players { game-id: game-id, player: third })) err-invalid-winner)

    ;; Transfer prizes
    (try! (as-contract (stx-transfer? (get first-prize game) tx-sender first)))
    (try! (as-contract (stx-transfer? (get second-prize game) tx-sender second)))
    (try! (as-contract (stx-transfer? (get third-prize game) tx-sender third)))

    ;; Update game status
    (map-set games
      { game-id: game-id }
      (merge game { status: "finalized" })
    )

    ;; Record winners
    (map-set winners
      { game-id: game-id }
      {
        first: first,
        second: second,
        third: third,
        distributed: true
      }
    )

    (ok true)
  )
)

;; Cancel game and refund host
(define-public (cancel-game (game-id (string-ascii 32)))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) err-game-not-found))
    )
    (asserts! (is-eq tx-sender (get host game)) err-not-host)
    (asserts! (is-eq (get status game) "waiting") err-game-not-active)

    ;; Refund to host
    (try! (as-contract (stx-transfer? (get total-prize game) tx-sender (get host game))))

    ;; Update status
    (map-set games
      { game-id: game-id }
      (merge game { status: "cancelled" })
    )

    (ok true)
  )
)

;; Read-only Functions

(define-read-only (get-game (game-id (string-ascii 32)))
  (map-get? games { game-id: game-id })
)

(define-read-only (get-player (game-id (string-ascii 32)) (player principal))
  (map-get? players { game-id: game-id, player: player })
)

(define-read-only (get-winners (game-id (string-ascii 32)))
  (map-get? winners { game-id: game-id })
)

(define-read-only (is-game-active (game-id (string-ascii 32)))
  (match (map-get? games { game-id: game-id })
    game (is-eq (get status game) "active")
    false
  )
)

(define-read-only (get-prize-distribution (game-id (string-ascii 32)))
  (match (map-get? games { game-id: game-id })
    game (some {
      first: (get first-prize game),
      second: (get second-prize game),
      third: (get third-prize game)
    })
    none
  )
)
