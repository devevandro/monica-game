"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, RefreshCw, Trophy, Users } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Personagens da Turma da Mônica com imagens reais
const characters = [
  {
    name: "MONICA",
    description: "Personagem principal, menina de vestido vermelho e coelhinho",
    image: "https://upload.wikimedia.org/wikipedia/pt/6/69/Monica_Turma_da_Monica.png"
  },
  {
    name: "CEBOLINHA",
    description: "Menino de cabelo espetado com problema de fala que troca R por L",
    image: "https://upload.wikimedia.org/wikipedia/pt/f/ff/Cebolinha_Turma_da_Monica.png"
  },
  {
    name: "CASCAO",
    description: "Menino que não gosta de tomar banho",
    image: "https://upload.wikimedia.org/wikipedia/pt/5/5a/Cascao_Turma_da_Monica.png"
  },
  {
    name: "MAGALI",
    description: "Menina que adora comer, principalmente melancia",
    image: "https://upload.wikimedia.org/wikipedia/pt/0/04/Magali_Turma_da_Monica.png"
  },
  {
    name: "CHICO BENTO",
    description: "Menino caipira que mora na roça",
    image: "https://upload.wikimedia.org/wikipedia/pt/f/f3/Chico_Bento_Turma_da_Monica.png"
  },
  {
    name: "FRANJINHA",
    description: "Menino cientista de cabelo loiro",
    image: "https://upload.wikimedia.org/wikipedia/pt/8/84/Franjinha_Turma_da_Monica.png"
  },
  {
    name: "BIDU",
    description: "Cachorro azul do Franjinha",
    image: "https://upload.wikimedia.org/wikipedia/pt/c/c7/Bidu_Turma_da_Monica.png"
  },
  {
    name: "ROSINHA",
    description: "Namorada do Chico Bento",
    image: "https://upload.wikimedia.org/wikipedia/pt/a/a4/Rosinha_Turma_da_Monica.png"
  },
  {
    name: "ANJINHO",
    description: "Primo do Cebolinha, menino anjo",
    image: "https://upload.wikimedia.org/wikipedia/pt/9/9a/Anjinho_Turma_da_Monica.png"
  },
  {
    name: "TITI",
    description: "Menina pequena e esperta",
    image: "https://upload.wikimedia.org/wikipedia/pt/1/1f/Titi_Turma_da_Monica.png"
  }
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
    color: ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute w-3 h-3 ${piece.color} opacity-80`}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            animation: 'confetti-fall linear infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default function Game() {
  const [currentCharacter, setCurrentCharacter] = useState<typeof characters[0] | null>(null)
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [inputLetter, setInputLetter] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [gameWon, setGameWon] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const [players, setPlayers] = useState<Player[]>([
    { name: "Jogador 1", score: 0, color: "bg-blue-500" },
    { name: "Jogador 2", score: 0, color: "bg-red-500" }
  ])

  const [playerNames, setPlayerNames] = useState({
    player1: "",
    player2: ""
  })

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

  // Inicia o jogo com os nomes dos jogadores
  const startGame = () => {
    if (playerNames.player1.trim() && playerNames.player2.trim()) {
      setPlayers([
        { name: playerNames.player1.trim(), score: 0, color: "bg-blue-500" },
        { name: playerNames.player2.trim(), score: 0, color: "bg-red-500" }
      ])
      setGameStarted(true)
    }
  }

  // Inicia uma nova rodada
  const startNewRound = () => {
    const randomIndex = Math.floor(Math.random() * characters.length)
    setCurrentCharacter(characters[randomIndex])
    setGuessedLetters([])
    setInputLetter("")
    setMessage("")
    setMessageType(null)
    setGameWon(false)
    setCurrentPlayerIndex(0)
    setShowConfetti(false)
  }

  // Próxima rodada
  const nextRound = () => {
    setRoundNumber(roundNumber + 1)
    startNewRound()
  }

  // Reinicia o jogo completo
  const resetGame = () => {
    setGameStarted(false)
    setRoundNumber(1)
    setPlayerNames({ player1: "", player2: "" })
    setPlayers([
      { name: "Jogador 1", score: 0, color: "bg-blue-500" },
      { name: "Jogador 2", score: 0, color: "bg-red-500" }
    ])
    setShowConfetti(false)
  }

  // Verifica se a letra está no nome do personagem
  const checkLetter = () => {
    if (!currentCharacter || !inputLetter || gameWon) return
    
    const letter = inputLetter.toUpperCase()
    
    // Verifica se a letra já foi adivinhada
    if (guessedLetters.includes(letter)) {
      setMessage("Essa letra já foi tentada!")
      setMessageType("error")
      setInputLetter("")
      return
    }
    
    // Adiciona a letra às letras adivinhadas
    const newGuessedLetters = [...guessedLetters, letter]
    setGuessedLetters(newGuessedLetters)
    
    // Verifica se a letra está no nome
    if (currentCharacter.name.includes(letter)) {
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
      const allLettersGuessed = [...currentCharacter.name].every(char => 
        newGuessedLetters.includes(char)
      )
      
      if (allLettersGuessed) {
        // Bônus de 50 pontos para quem completar o nome
        newPlayers[currentPlayerIndex].score += 50
        setPlayers(newPlayers)
        setMessage(`🎉 ${players[currentPlayerIndex].name} completou o nome! +50 pontos de bônus! 🎉`)
        setGameWon(true)
        setShowConfetti(true) // Ativa os confetes!
      }
      
      // Jogador continua jogando se acertou
    } else {
      setMessage(`${players[currentPlayerIndex].name} errou. Vez do próximo jogador!`)
      setMessageType("error")
      
      // Muda para o próximo jogador
      setCurrentPlayerIndex((currentPlayerIndex + 1) % 2)
    }
    
    setInputLetter("")
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
    const correctGuesses = uniqueLettersInName.filter(letter => guessedLetters.includes(letter))
    
    return Math.min(100, Math.round((correctGuesses.length / uniqueLettersInName.length) * 100))
  }

  // Tela inicial para inserir nomes dos jogadores
  if (!gameStarted) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Adivinha Turma da Mônica
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configurar Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Jogador 1:</label>
              <Input
                value={playerNames.player1}
                onChange={(e) => setPlayerNames({...playerNames, player1: e.target.value})}
                placeholder="Digite o nome do jogador 1"
                maxLength={15}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Jogador 2:</label>
              <Input
                value={playerNames.player2}
                onChange={(e) => setPlayerNames({...playerNames, player2: e.target.value})}
                placeholder="Digite o nome do jogador 2"
                maxLength={15}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerNames.player1.trim() && playerNames.player2.trim()) {
                    startGame()
                  }
                }}
              />
            </div>
            
            <Button 
              onClick={startGame} 
              className="w-full"
              disabled={!playerNames.player1.trim() || !playerNames.player2.trim()}
            >
              Começar Jogo
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Jogo para dois jogadores!</p>
          <p>Vocês vão se alternar para adivinhar as letras.</p>
          <p>Ganhe pontos por cada letra correta e bônus por completar o nome!</p>
        </div>
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
          
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg text-white text-center ${player.color} ${
                  index === currentPlayerIndex && !gameWon ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="font-semibold">{player.name}</div>
                <div className="text-2xl font-bold">{player.score}</div>
                {index === currentPlayerIndex && !gameWon && (
                  <div className="text-xs mt-1">SUA VEZ!</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {currentCharacter && (
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4 overflow-hidden rounded-lg border-2 border-gray-200">
              <div 
                className="absolute inset-0 bg-white"
                style={{ 
                  clipPath: `inset(0 ${100 - calculateRevealPercentage()}% 0 0)` 
                }}
              >
                <img 
                  src={currentCharacter.image || "/placeholder.svg"} 
                  alt="Personagem da Turma da Mônica" 
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback para placeholder se a imagem não carregar
                    e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <p className="text-lg font-medium text-gray-500">
                  {calculateRevealPercentage()}% revelado
                </p>
              </div>
            </div>
            
            <div className="flex justify-center my-4 flex-wrap">
              {renderName()}
            </div>
            
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
                
                {message && (
                  <Alert 
                    variant={messageType === "error" ? "destructive" : "default"} 
                    className="mt-4"
                  >
                    {messageType === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <AlertDescription className="text-center">{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Vez de: <span className="font-semibold text-lg">{players[currentPlayerIndex].name}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
