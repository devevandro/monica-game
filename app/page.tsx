"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, RefreshCw, Trophy, Users, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Personagens da Turma da Mônica com imagens reais
const characters = [
  {
    name: "MONICA",
    description: "Personagem principal, menina de vestido vermelho e coelhinho",
    image: "https://www.imagenspng.com.br/wp-content/uploads/2015/06/monica-01-724x1024.png",
  },
  {
    name: "CEBOLINHA",
    description: "Menino de cabelo espetado com problema de fala que troca R por L",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH0ccGyNmhk-fMrDp0NxyzFQDSyIs7UgYviw&s",
  },
  {
    name: "CASCAO",
    description: "Menino que não gosta de tomar banho",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDIZXuocNpBkwcCnTUuhGYMNhjGe7wsGUZMg&s",
  },
  {
    name: "MAGALI",
    description: "Menina que adora comer, principalmente melancia",
    image: "https://static.wikia.nocookie.net/monica/images/4/4f/Magali_Lima.png/revision/latest?cb=20250518184632&path-prefix=pt-br",
  },
  {
    name: "CHICO BENTO",
    description: "Menino caipira que mora na roça",
    image: "https://static.wikia.nocookie.net/monica/images/6/6f/Chico_bento.png/revision/latest?cb=20140930163812&path-prefix=pt-br",
  },
  {
    name: "FRANJINHA",
    description: "Menino cientista de cabelo loiro",
    image: "https://static.wikia.nocookie.net/monica/images/9/9b/Franjinha_com_seu_jaleco.png/revision/latest?cb=20140327120606&path-prefix=pt-br",
  },
  {
    name: "BIDU",
    description: "Cachorro azul do Franjinha",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSUDJH_zmtHy-Ri7hzbemOu6ZguotW5NikDw&s",
  },
  {
    name: "ROSINHA",
    description: "Namorada do Chico Bento",
    image: "https://static.wikia.nocookie.net/monica/images/0/08/Rosinha.png/revision/latest?cb=20140503031921&path-prefix=pt-br",
  },
  {
    name: "ANJINHO",
    description: "Primo do Cebolinha, menino anjo",
    image: "https://static.wikia.nocookie.net/monica/images/4/4d/Anjinho.png/revision/latest?cb=20180303010917&path-prefix=pt-br",
  },
  {
    name: "TITI",
    description: "Menino esperto",
    image: "https://upload.wikimedia.org/wikipedia/pt/f/f3/Titi_%28Turma_da_M%C3%B4nica%29.png",
  },
  {
    name: "XAVECO",
    description: "Amigo de todos",
    image: "https://upload.wikimedia.org/wikipedia/pt/9/92/Xaveco_%28personagem%29.png",
  },
]

interface Player {
  name: string
  score: number
  color: string
}

// Componente de Confetes
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-purple-500", "bg-pink-500"][
      Math.floor(Math.random() * 6)
    ],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute w-3 h-3 ${piece.color} opacity-80 rounded-sm`}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            animation: "confetti-fall linear infinite",
          }}
        />
      ))}
    </div>
  )
}

// Componente para mostrar letras já tentadas (todas)
const TriedLetters = ({ correctLetters, wrongLetters }: { correctLetters: string[]; wrongLetters: string[] }) => {
  const allTriedLetters = [...correctLetters, ...wrongLetters]

  if (allTriedLetters.length === 0) return null

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-2 text-center text-muted-foreground">Letras já tentadas</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {correctLetters.map((letter, index) => (
            <Badge key={`correct-${index}`} variant="default" className="text-sm bg-green-500">
              {letter}
            </Badge>
          ))}
          {wrongLetters.map((letter, index) => (
            <Badge key={`wrong-${index}`} variant="destructive" className="text-sm">
              {letter}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Game() {
  const [gameMode, setGameMode] = useState<"select" | "single" | "multi">("select")
  const [currentCharacter, setCurrentCharacter] = useState<(typeof characters)[0] | null>(null)
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [wrongLetters, setWrongLetters] = useState<string[]>([])
  const [inputLetter, setInputLetter] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [gameWon, setGameWon] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [revealPercentage, setRevealPercentage] = useState(0)

  const [players, setPlayers] = useState<Player[]>([
    { name: "Jogador 1", score: 0, color: "bg-blue-500" },
    { name: "Jogador 2", score: 0, color: "bg-red-500" },
  ])

  const [playerNames, setPlayerNames] = useState({
    player1: "",
    player2: "",
  })

  const [canGuessFullName, setCanGuessFullName] = useState(false)
  const [fullNameGuess, setFullNameGuess] = useState("")
  const [isGuessingFullName, setIsGuessingFullName] = useState(false)

  // Inicializa o jogo
  useEffect(() => {
    if (gameStarted) {
      startNewRound()
    }
  }, [gameStarted])

  // Para os confetes após 4 segundos
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  // Animação suave para revelar o personagem
  useEffect(() => {
    if (currentCharacter) {
      const newPercentage = calculateRevealPercentage()
      setRevealPercentage(newPercentage)
    }
  }, [guessedLetters, currentCharacter])

  // Verifica se pode adivinhar o nome completo (4+ letras corretas)
  useEffect(() => {
    if (guessedLetters.length >= 4) {
      setCanGuessFullName(true)
    }
  }, [guessedLetters])

  // Seleciona modo de jogo
  const selectGameMode = (mode: "single" | "multi") => {
    setGameMode(mode)
    if (mode === "single") {
      setPlayers([{ name: "Você", score: 0, color: "bg-blue-500" }])
      setGameStarted(true)
    }
  }

  // Inicia o jogo com os nomes dos jogadores (modo multiplayer)
  const startMultiplayerGame = () => {
    if (playerNames.player1.trim() && playerNames.player2.trim()) {
      setPlayers([
        { name: playerNames.player1.trim(), score: 0, color: "bg-blue-500" },
        { name: playerNames.player2.trim(), score: 0, color: "bg-red-500" },
      ])
      setGameStarted(true)
    }
  }

  // Inicia uma nova rodada
  const startNewRound = () => {
    const randomIndex = Math.floor(Math.random() * characters.length)
    setCurrentCharacter(characters[randomIndex])
    setGuessedLetters([])
    setWrongLetters([])
    setInputLetter("")
    setMessage("")
    setMessageType(null)
    setGameWon(false)
    setCurrentPlayerIndex(0)
    setShowConfetti(false)
    setRevealPercentage(0)
    setCanGuessFullName(false)
    setFullNameGuess("")
    setIsGuessingFullName(false)
  }

  // Próxima rodada
  const nextRound = () => {
    setRoundNumber(roundNumber + 1)
    startNewRound()
  }

  // Reinicia o jogo completo
  const resetGame = () => {
    setGameMode("select")
    setGameStarted(false)
    setRoundNumber(1)
    setPlayerNames({ player1: "", player2: "" })
    setPlayers([
      { name: "Jogador 1", score: 0, color: "bg-blue-500" },
      { name: "Jogador 2", score: 0, color: "bg-red-500" },
    ])
    setShowConfetti(false)
    setRevealPercentage(0)
  }

  // Verifica se a letra está no nome do personagem
  const checkLetter = () => {
    if (!currentCharacter || !inputLetter || gameWon) return

    const letter = inputLetter.toUpperCase()

    // Verifica se a letra já foi adivinhada
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
      setMessage("Essa letra já foi tentada!")
      setMessageType("error")
      setInputLetter("")
      return
    }

    // Verifica se a letra está no nome
    if (currentCharacter.name.includes(letter)) {
      // Adiciona a letra às letras corretas
      const newGuessedLetters = [...guessedLetters, letter]
      setGuessedLetters(newGuessedLetters)

      // Conta quantas vezes a letra aparece no nome
      const letterCount = currentCharacter.name.split(letter).length - 1
      const points = letterCount * 10 // 10 pontos por cada ocorrência da letra

      // Atualiza a pontuação do jogador atual
      const newPlayers = [...players]
      newPlayers[currentPlayerIndex].score += points
      setPlayers(newPlayers)

      setMessage(`${players[currentPlayerIndex].name} acertou! +${points} pontos`)
      setMessageType("success")

      // Verifica se o jogador ganhou
      const allLettersGuessed = [...currentCharacter.name].every((char) => newGuessedLetters.includes(char))

      if (allLettersGuessed) {
        // Bônus de 50 pontos para quem completar o nome
        newPlayers[currentPlayerIndex].score += 50
        setPlayers(newPlayers)
        setMessage(`🎉 ${players[currentPlayerIndex].name} completou o nome! +50 pontos de bônus! 🎉`)
        setGameWon(true)
        setShowConfetti(true)
      }

      // Jogador continua jogando se acertou (não muda de jogador)
    } else {
      // Adiciona a letra às letras erradas
      setWrongLetters([...wrongLetters, letter])

      setMessage(
        `${players[currentPlayerIndex].name} errou. ${gameMode === "multi" ? "Vez do próximo jogador!" : "Tente outra letra!"}`,
      )
      setMessageType("error")

      // Muda para o próximo jogador apenas no modo multiplayer
      if (gameMode === "multi") {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % 2)
      }
    }

    setInputLetter("")
  }

  // Verifica se o nome completo está correto
  const checkFullName = () => {
    if (!currentCharacter || !fullNameGuess.trim() || gameWon) return

    const guess = fullNameGuess.toUpperCase().trim()

    if (guess === currentCharacter.name) {
      // Acertou o nome completo!
      const newPlayers = [...players]
      newPlayers[currentPlayerIndex].score += 100 // Bônus maior por acertar o nome completo
      setPlayers(newPlayers)

      setMessage(`🎉 ${players[currentPlayerIndex].name} acertou o nome completo! +100 pontos! 🎉`)
      setMessageType("success")
      setGameWon(true)
      setShowConfetti(true)
      setRevealPercentage(100) // Revela a imagem completamente
    } else {
      setMessage(
        `${players[currentPlayerIndex].name} errou o nome completo. ${gameMode === "multi" ? "Vez do próximo jogador!" : "Continue tentando!"}`,
      )
      setMessageType("error")

      // Muda para o próximo jogador apenas no modo multiplayer
      if (gameMode === "multi") {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % 2)
      }
    }

    setFullNameGuess("")
    setIsGuessingFullName(false)
  }

  // Renderiza o nome com as letras adivinhadas
  const renderName = () => {
    if (!currentCharacter) return null

    return currentCharacter.name.split("").map((letter, index) => (
      <span
        key={index}
        className={`inline-block w-8 h-8 mx-1 text-center border-b-2 border-primary text-xl font-bold ${
          guessedLetters.includes(letter) ? "text-primary" : "text-transparent"
        }`}
      >
        {letter}
      </span>
    ))
  }

  // Calcula a porcentagem de revelação da imagem
  const calculateRevealPercentage = () => {
    if (!currentCharacter) return 0

    const uniqueLettersInName = [...new Set(currentCharacter.name.split(""))]
    const correctGuesses = uniqueLettersInName.filter((letter) => guessedLetters.includes(letter))

    return Math.min(100, Math.round((correctGuesses.length / uniqueLettersInName.length) * 100))
  }

  // Tela de seleção de modo de jogo
  if (gameMode === "select") {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">Adivinha Turma da Mônica</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Escolha o modo de jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => selectGameMode("single")} className="w-full h-16 text-lg" variant="outline">
              <User className="mr-2 h-6 w-6" />
              Um Jogador
            </Button>

            <Button onClick={() => selectGameMode("multi")} className="w-full h-16 text-lg" variant="outline">
              <Users className="mr-2 h-6 w-6" />
              Dois Jogadores
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Descubra os personagens da Turma da Mônica!</p>
          <p>Adivinhe as letras para revelar o personagem.</p>
          <p>Após acertar 4+ letras, você pode tentar o nome completo!</p>
        </div>
      </div>
    )
  }

  // Tela de configuração para modo multiplayer
  if (gameMode === "multi" && !gameStarted) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Configurar Jogadores</h1>
          <Button variant="outline" size="sm" onClick={() => setGameMode("select")}>
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nomes dos Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Jogador 1:</label>
              <Input
                value={playerNames.player1}
                onChange={(e) => setPlayerNames({ ...playerNames, player1: e.target.value })}
                placeholder="Digite o nome do jogador 1"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nome do Jogador 2:</label>
              <Input
                value={playerNames.player2}
                onChange={(e) => setPlayerNames({ ...playerNames, player2: e.target.value })}
                placeholder="Digite o nome do jogador 2"
                maxLength={15}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerNames.player1.trim() && playerNames.player2.trim()) {
                    startMultiplayerGame()
                  }
                }}
              />
            </div>

            <Button
              onClick={startMultiplayerGame}
              className="w-full"
              disabled={!playerNames.player1.trim() || !playerNames.player2.trim()}
            >
              Começar Jogo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4 relative">
      <Confetti show={showConfetti} />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Turma da Mônica</h1>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Novo Jogo
        </Button>
      </div>

      {/* Placar */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Rodada {roundNumber}</h3>
            <Badge variant="outline">Placar</Badge>
          </div>

          {gameMode === "single" ? (
            <div className="text-center">
              <div className="p-3 rounded-lg bg-blue-500 text-white">
                <div className="font-semibold">{players[0].name}</div>
                <div className="text-2xl font-bold">{players[0].score}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-white text-center ${player.color} ${
                    index === currentPlayerIndex && !gameWon ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-2xl font-bold">{player.score}</div>
                  {index === currentPlayerIndex && !gameWon && <div className="text-xs mt-1">SUA VEZ!</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Letras já tentadas */}
      <TriedLetters correctLetters={guessedLetters} wrongLetters={wrongLetters} />

      {currentCharacter && (
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4 overflow-hidden rounded-lg border-2 border-gray-200">
              <div
                className="absolute inset-0 bg-white transition-all duration-1000 ease-out"
                style={{
                  clipPath: `inset(0 ${100 - revealPercentage}% 0 0)`,
                }}
              >
                <img
                  src={currentCharacter.image || "/placeholder.svg"}
                  alt="Personagem da Turma da Mônica"
                  className="w-full h-full object-contain transition-opacity duration-500"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <p className="text-lg font-medium text-gray-500">{revealPercentage}% revelado</p>
              </div>
            </div>

            <div className="flex justify-center my-4 flex-wrap">{renderName()}</div>

            {gameWon ? (
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-lg">🎉 Personagem descoberto! 🎉</span>
                </div>
                <p className="text-lg font-medium mb-4 text-center">{currentCharacter.description}</p>
                <Button onClick={nextRound} className="mt-2" size="lg">
                  Próxima Rodada
                </Button>
              </div>
            ) : (
              <div className="w-full mt-4">
                {!isGuessingFullName ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={inputLetter}
                        onChange={(e) => setInputLetter(e.target.value.slice(0, 1))}
                        placeholder="Digite uma letra"
                        className="text-center text-lg"
                        maxLength={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") checkLetter()
                        }}
                      />
                      <Button onClick={checkLetter} size="lg">
                        Tentar
                      </Button>
                    </div>

                    {canGuessFullName && (
                      <div className="mt-4">
                        <Button onClick={() => setIsGuessingFullName(true)} variant="secondary" className="w-full">
                          💡 Tentar nome completo
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          Você já acertou {guessedLetters.length} letras. Que tal tentar o nome completo?
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={fullNameGuess}
                        onChange={(e) => setFullNameGuess(e.target.value)}
                        placeholder="Digite o nome completo"
                        className="text-center text-lg"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") checkFullName()
                          if (e.key === "Escape") setIsGuessingFullName(false)
                        }}
                        autoFocus
                      />
                      <Button onClick={checkFullName} size="lg">
                        Confirmar
                      </Button>
                    </div>
                    <Button onClick={() => setIsGuessingFullName(false)} variant="outline" size="sm" className="w-full">
                      Voltar para letras
                    </Button>
                  </div>
                )}

                {message && (
                  <Alert variant={messageType === "error" ? "destructive" : "default"} className="mt-4">
                    {messageType === "error" ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    <AlertDescription className="text-center">{message}</AlertDescription>
                  </Alert>
                )}

                {gameMode === "multi" && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Vez de: <span className="font-semibold text-lg">{players[currentPlayerIndex].name}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
