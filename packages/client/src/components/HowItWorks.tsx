import { LuUsers, LuSparkles, LuPencil, LuSmile, LuTrophy } from 'react-icons/lu';

export function HowItWorks() {
  const steps = [
    {
      num: '①',
      title: 'Create Room',
      desc: 'Customize rounds, draw time, and invite style.',
      icon: <LuSparkles className="size-6 text-game-yellow" />,
      color: 'from-game-yellow/20 to-game-yellow/5 border-game-yellow/30',
    },
    {
      num: '②',
      title: 'Invite Friends',
      desc: 'Copy invite link and share it with your buddies.',
      icon: <LuUsers className="size-6 text-game-blue" />,
      color: 'from-game-blue/20 to-game-blue/5 border-game-blue/30',
    },
    {
      num: '③',
      title: 'Draw',
      desc: 'Sketch the chosen secret word on the shared canvas.',
      icon: <LuPencil className="size-6 text-game-purple" />,
      color: 'from-game-purple/20 to-game-purple/5 border-game-purple/30',
    },
    {
      num: '④',
      title: 'Guess',
      desc: 'Type your guesses in the chat box to gain points.',
      icon: <LuSmile className="size-6 text-game-pink" />,
      color: 'from-game-pink/20 to-game-pink/5 border-game-pink/30',
    },
    {
      num: '⑤',
      title: 'Win',
      desc: 'Highest score at the end takes home the crown!',
      icon: <LuTrophy className="size-6 text-game-green" />,
      color: 'from-game-green/20 to-game-green/5 border-game-green/30',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="font-display text-gradient text-3xl font-bold tracking-tight mb-2">
          How DoodleDash Works
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Start a room in seconds and jump into real-time drawing actions. No signups required!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {/* Connection line for Desktop */}
        <div className="hidden md:block absolute top-1/3 left-6 right-6 h-0.5 bg-gradient-to-r from-game-yellow via-game-purple to-game-green -z-10 opacity-30" />

        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-card rounded-card border border-border/50 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group hover:-translate-y-1 duration-300"
          >
            {/* Step gradient circle background overlay */}
            <div className={`absolute -top-10 -right-10 size-24 rounded-full bg-gradient-to-br ${step.color} blur-xl opacity-80 group-hover:scale-125 transition-transform duration-500`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 group-hover:bg-background transition-all duration-300 border border-border/30">
                {step.icon}
              </div>
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1 flex items-center gap-1">
                <span className="text-primary font-display">{step.num}</span> Step
              </span>
              <h3 className="font-display font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
