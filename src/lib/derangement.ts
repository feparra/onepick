export interface ParticipantInput {
  id: string;
  name: string;
}

/**
 * Generates a closed Hamiltonian cycle where:
 * 1. Nobody is assigned to themselves.
 * 2. If n > 2, there are no closed 2-person sub-cycles (A -> B and B -> A).
 * 3. Every participant is both a giver and a receiver in one continuous loop.
 */
export function generateSecretSantaAssignments(
  participants: ParticipantInput[]
): Record<string, string> {
  if (participants.length < 2) {
    throw new Error("Se necesitan al menos 2 participantes para realizar el sorteo.");
  }

  // Fisher-Yates shuffle
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Circular assignment: index i gives to (i + 1) % length
  const assignments: Record<string, string> = {};
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    assignments[giver.id] = receiver.id;
  }

  return assignments; // { [giver_id]: receiver_id }
}
