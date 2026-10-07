const PARTICLE_COUNT = 14;

export default function LoginParticles() {
  return (
    <div className="login-particles" aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <span
          key={i}
          className="login-particle"
          style={{
            "--i": i,
            "--x": `${6 + ((i * 19) % 88)}%`,
            "--delay": `${(i * 0.55) % 7}s`,
            "--duration": `${16 + (i % 5) * 3.5}s`,
            "--size": `${3 + (i % 4) * 2}px`,
          }}
        />
      ))}
    </div>
  );
}
