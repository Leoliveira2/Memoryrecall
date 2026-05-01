import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, X } from "lucide-react";

export default function HelpGuide() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl"
        title="Abrir Guia de Ajuda"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Guia de Ajuda - Memory Lab</DialogTitle>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="palace">Memory Palace</TabsTrigger>
              <TabsTrigger value="sessions">Sessões</TabsTrigger>
              <TabsTrigger value="challenges">Desafios</TabsTrigger>
              <TabsTrigger value="tips">Dicas</TabsTrigger>
            </TabsList>

            {/* VISÃO GERAL */}
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">O que é Memory Lab?</h3>
                <p className="text-sm text-muted-foreground">
                  Memory Lab é um sistema adaptativo de treinamento de memória baseado em ciência. Combina técnicas comprovadas como Repetição Espaçada, Recordação Ativa e Codificação Profunda para melhorar sua retenção de informação.
                </p>

                <h3 className="font-semibold text-lg mt-4">Como Funciona?</h3>
                <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                  <li><strong>Adicione itens:</strong> Crie cartões com definição, exemplo e importância</li>
                  <li><strong>Treine diariamente:</strong> Complete 4 desafios de memória de trabalho</li>
                  <li><strong>Revise:</strong> O sistema automaticamente agenda revisões nos momentos certos</li>
                  <li><strong>Melhore:</strong> Acompanhe seu progresso e veja a retenção aumentar</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">Métricas Principais</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li><strong>Retention Rate:</strong> Percentual de itens que você lembra corretamente</li>
                  <li><strong>Due Today:</strong> Quantos itens precisam ser revisados hoje</li>
                  <li><strong>Learn Queue:</strong> Novos itens aguardando aprendizado</li>
                  <li><strong>Day Streak:</strong> Dias consecutivos de treino</li>
                </ul>
              </div>
            </TabsContent>

            {/* MEMORY PALACE */}
            <TabsContent value="palace" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">O que é Memory Palace?</h3>
                <p className="text-sm text-muted-foreground">
                  Memory Palace (Método de Loci) é uma técnica milenar usada por campeões de memória. Você associa informações a locais específicos em um lugar imaginário que você conhece bem (sua casa, uma rua, etc).
                </p>

                <h3 className="font-semibold text-lg mt-4">Como Usar?</h3>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p className="text-sm"><strong>1. Escolha um local:</strong> Sua casa, escritório, rua que conhece bem</p>
                  <p className="text-sm"><strong>2. Crie uma rota:</strong> Mentalmente, caminhe por esse local em ordem</p>
                  <p className="text-sm"><strong>3. Associe itens:</strong> Coloque cada coisa para memorizar em um ponto da rota</p>
                  <p className="text-sm"><strong>4. Revise:</strong> Caminhe mentalmente pela rota para recuperar as informações</p>
                </div>

                <h3 className="font-semibold text-lg mt-4">Exemplo Prático</h3>
                <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Quer memorizar:</strong> Spaced Repetition, Active Recall, Chunking</p>
                  <p><strong>Seu local:</strong> Sua casa</p>
                  <p>• <strong>Porta:</strong> Imagine "Spaced Repetition" escrito gigante na porta</p>
                  <p>• <strong>Sala:</strong> Veja "Active Recall" em neon na parede</p>
                  <p>• <strong>Cozinha:</strong> Visualize "Chunking" em letras de fogo</p>
                </div>

                <h3 className="font-semibold text-lg mt-4">Por que Funciona?</h3>
                <p className="text-sm text-muted-foreground">
                  Nosso cérebro é visual e espacial. Associar informações a lugares que você já conhece cria múltiplas conexões neurais, tornando a recuperação muito mais fácil.
                </p>
              </div>
            </TabsContent>

            {/* SESSÕES */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Modos de Sessão</h3>
                <p className="text-sm text-muted-foreground">
                  Cada sessão é adaptada ao seu nível de bem-estar. Complete o Wellness Check-in para que o sistema escolha o modo ideal.
                </p>

                <div className="space-y-3 mt-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🟢 Recovery Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Você está cansado ou estressado. Sessão mais curta com menos itens para revisar. Foco em consolidação.</p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🟡 Balanced Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Você está bem. Sessão padrão com mix equilibrado de novos itens e revisão. Recomendado.</p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🔴 Stretch Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Você está energizado. Sessão intensiva com mais desafios. Aproveite para aprender mais.</p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mt-4">Fases da Sessão</h3>
                <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                  <li><strong>Check-in:</strong> Confirme seu bem-estar</li>
                  <li><strong>Learn:</strong> Estude novos itens com contexto</li>
                  <li><strong>Recall:</strong> Teste sua recordação ativa</li>
                  <li><strong>Working Memory:</strong> Desafio de memória de trabalho</li>
                  <li><strong>Review:</strong> Revise itens vencidos com SM-2</li>
                  <li><strong>Summary:</strong> Veja seu score e progresso</li>
                </ol>
              </div>
            </TabsContent>

            {/* DESAFIOS */}
            <TabsContent value="challenges" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Desafios de Memória de Trabalho</h3>
                <p className="text-sm text-muted-foreground">
                  Você faz 4 desafios diferentes por dia. Cada um treina um tipo diferente de memória. A dificuldade aumenta conforme você avança no currículo.
                </p>

                <div className="space-y-3 mt-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🎨 Dias 1-10: Cores (Fácil)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Memorize uma sequência de cores. Elas aparecem em ordem, depois embaralhadas. Clique na ordem que viu.</p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🔢 Dias 11-20: Números (Médio)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Memorize sequências de números. Mais desafiador que cores. Treina memória numérica.</p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">📝 Dias 21-30: Palavras (Difícil)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Memorize sequências de palavras. O mais desafiador. Treina memória semântica.</p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">🎯 Padrões (Avançado)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Memorize padrões visuais complexos. Combina tudo que você aprendeu.</p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mt-4">Como Ganhar Pontos</h3>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>✓ Acertar a sequência completa = 5 pontos</li>
                  <li>✓ Acertar 75% = 3 pontos</li>
                  <li>✓ Acertar 50% = 1 ponto</li>
                  <li>✗ Errar = 0 pontos</li>
                </ul>
              </div>
            </TabsContent>

            {/* DICAS */}
            <TabsContent value="tips" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Dicas para Maximizar Retenção</h3>

                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">💡 Codificação Profunda</h4>
                    <p className="text-xs text-muted-foreground mt-1">Ao adicionar um item, preencha TODOS os campos (definição, exemplo, importância). Quanto mais contexto, melhor a retenção.</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">🔄 Consistência é Chave</h4>
                    <p className="text-xs text-muted-foreground mt-1">Treine TODOS os dias. Uma semana consistente melhora retenção em até 40%. Seu streak importa!</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">😴 Durma Bem</h4>
                    <p className="text-xs text-muted-foreground mt-1">A consolidação de memória acontece durante o sono. Registre seu sono no Wellness Check-in. 7-9 horas é ideal.</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">🧠 Use Memory Palace</h4>
                    <p className="text-xs text-muted-foreground mt-1">Para itens importantes, adicione um "locus" (local) e uma "vivid cue" (pista vívida). Visualize enquanto estuda.</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">📊 Acompanhe Progresso</h4>
                    <p className="text-xs text-muted-foreground mt-1">Veja seus gráficos semanalmente. Identifique padrões: quando você lembra melhor? Qual tipo de desafio é mais fácil?</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm">⚡ Modo Catch-up</h4>
                    <p className="text-xs text-muted-foreground mt-1">Se perdeu um dia, não desista! Use Recovery Mode para voltar ao ritmo sem sobrecarregar.</p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mt-4">Ciência por Trás</h3>
                <p className="text-xs text-muted-foreground">
                  Memory Lab usa o algoritmo SM-2 (Spaced Repetition), que calcula o melhor momento para revisar cada item. Estudos mostram que revisar no momento certo aumenta retenção em até 90% comparado com releitura passiva.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
