# AtomSynthesizer — Development Rules

**File:** `rules.md`
**Project:** AtomSynthesizer
**Version:** 1.0.0
**Purpose:** Engineering rules and constraints for human developers and coding agents

---

# 1. Mission

AtomSynthesizer is an interactive molecular modeling, visualization, analysis, and reaction platform.

The system must prioritize:

1. Scientific correctness
2. Architectural separation
3. 3D performance
4. Type safety
5. Extensibility
6. Maintainability
7. Clear scientific uncertainty
8. User experience

Do not sacrifice the underlying molecular model merely to make the UI visually impressive.

---

# 2. Source of Truth

The project documentation hierarchy is:

```text
rules.md
    ↓
architecture.md
    ↓
prd.md
    ↓
Implementation
```

`rules.md` contains engineering constraints.

`architecture.md` defines system architecture.

`prd.md` defines product requirements.

If implementation conflicts with these documents, stop and resolve the conflict instead of silently choosing a different architecture.

---

# 3. Core Rule

## The molecular domain model is the source of truth.

Never make Three.js state the authoritative representation of a molecule.

Correct:

```text
Molecular Graph
      ↓
Renderer
      ↓
Three.js
```

Incorrect:

```text
Three.js Mesh
      ↓
Chemical State
```

Three.js objects are rendering artifacts.

---

# 4. Chemistry Must Be Renderer Independent

The chemistry domain must not import:

```text
React
Next.js
Three.js
React Three Fiber
DOM APIs
Browser APIs
```

The following must be possible:

```text
Run chemistry tests
```

without:

```text
Browser
Canvas
React
Three.js
```

being present.

---

# 5. Rendering Must Be Chemistry Independent

The renderer must consume molecular data through a defined interface.

Do not implement chemistry rules inside:

```text
AtomRenderer.tsx
BondRenderer.tsx
MoleculeRenderer.tsx
MolecularCanvas.tsx
```

Bad:

```ts
if (atom.element === 6) {
    // carbon chemistry logic
}
```

Good:

```text
Chemistry Domain
      ↓
Render Model
      ↓
AtomRenderer
```

---

# 6. Never Couple Domain Objects to Three.js

Never add:

```ts
mesh: THREE.Mesh
```

to:

```text
Atom
Bond
Molecule
Reaction
```

Domain entities must contain scientific data only.

---

# 7. No Direct Mutation

Do not directly mutate molecular state from UI components.

Bad:

```ts
molecule.atoms.push(atom);
```

Good:

```text
CreateAtomCommand
      ↓
MolecularGraph
      ↓
Store
```

All important mutations must pass through domain/application services.

---

# 8. Command-Based Editing

User-editable molecular operations must use commands.

Examples:

```text
AddAtomCommand
DeleteAtomCommand
MoveAtomCommand
CreateBondCommand
DeleteBondCommand
ChangeBondOrderCommand
ChangeChargeCommand
ChangeIsotopeCommand
```

Commands must support:

```ts
execute()
undo()
```

where the operation is reversible.

---

# 9. Undo/Redo Is Mandatory

Every meaningful editing action must be compatible with undo/redo.

At minimum:

```text
Add Atom
Delete Atom
Move Atom
Create Bond
Delete Bond
Change Bond Order
Change Charge
Change Isotope
```

Do not create one-off mutation paths that bypass history.

---

# 10. IDs

Every domain entity must have a stable unique ID.

Examples:

```text
atom_xxxxx
bond_xxxxx
molecule_xxxxx
reaction_xxxxx
project_xxxxx
```

Do not use array indexes as persistent IDs.

Bad:

```ts
atoms[3]
```

Good:

```ts
atomsById["atom_123"]
```

---

# 11. Atom Identity

Atom identity must remain stable while editing.

Moving an atom must not generate a new atom ID.

Changing an atom's position:

```text
atom_01
    ↓
same atom_01
```

Changing an element:

```text
atom_01
Carbon → Oxygen
```

must still preserve identity unless the operation semantically represents deletion and recreation.

---

# 12. Bond Identity

Bonds must reference atoms by ID.

```ts
interface Bond {
    id: string;
    atomA: string;
    atomB: string;
    order: number;
}
```

Never store duplicated atom objects inside bonds.

---

# 13. Molecular Graph

The molecular graph is the central chemical structure.

It must support:

```text
addAtom()
removeAtom()

addBond()
removeBond()

getAtom()
getBond()

getNeighbors()

getBondOrder()

getConnectedComponents()
```

The graph must remain independent from UI state.

---

# 14. Molecule vs Visualization

A molecule is not a scene.

A molecule contains:

```text
Atoms
Bonds
Charge
Multiplicity
Coordinates
Metadata
```

A scene contains:

```text
Meshes
Lights
Camera
Materials
Controls
Helpers
```

Never mix the two.

---

# 15. Coordinates

Coordinates must be stored independently from Three.js.

Use:

```ts
interface Coordinate {
    atomId: string;
    x: number;
    y: number;
    z: number;
}
```

Do not store:

```ts
THREE.Vector3
```

inside persisted domain data.

---

# 16. Units

Physical quantities must always have explicit units.

Examples:

```text
Distance → Å
Angle → degrees
Mass → g/mol
Temperature → K
Pressure → Pa
Energy → explicitly specified unit
```

Do not pass ambiguous physical values through the system.

---

# 17. Unit Conversion

All conversions must happen through a centralized unit system.

Do not scatter:

```ts
value * 10
```

through the codebase.

Use dedicated utilities:

```text
angstromToScene()
sceneToAngstrom()
kelvinToCelsius()
```

where appropriate.

---

# 18. Scene Scale

Three.js scene units must have a documented relationship to chemical units.

Example:

```text
1 Å = 1 scene unit
```

or another explicitly defined scale.

Do not arbitrarily change molecular scale in individual components.

---

# 19. Element Data

Element information must come from a centralized dataset.

Use:

```text
data/elements.json
```

or a dedicated element repository.

Do not duplicate element properties across:

```text
components/
chemistry/
renderer/
pages/
```

---

# 20. Element Data Must Be Immutable

Periodic-table reference data should not be mutated at runtime.

The following should not be editable through ordinary molecule editing:

```text
Atomic Number
Element Name
Atomic Mass
Group
Period
```

Atom-specific values such as:

```text
Charge
Isotope
Position
```

belong to the atom.

---

# 21. Periodic Table

The periodic table must support:

```text
Search
Selection
Element Details
Add Atom
```

Selecting an element should not immediately modify the molecule unless the user explicitly chooses an action.

---

# 22. Atom Creation

Adding an atom must follow:

```text
Element Selection
      ↓
Create Atom Command
      ↓
Domain Validation
      ↓
Store Update
      ↓
Renderer Update
```

Do not create atoms directly inside the canvas component.

---

# 23. Atom Positioning

Atom placement must avoid unnecessary overlap.

If automatic placement is used, it must be deterministic where practical.

Do not randomly place atoms every time the same operation occurs.

---

# 24. Bond Creation

Bond creation must use atom IDs.

Workflow:

```text
Select Atom A
      ↓
Select Atom B
      ↓
CreateBondCommand
      ↓
Validate
      ↓
Create Bond
```

---

# 25. Bond Validation

The system should check:

```text
Atom existence
Duplicate bond
Bond order
Valence
Charge
Element compatibility
```

Validation warnings should not automatically prevent unusual scientific structures unless the system has sufficient confidence that the operation is invalid.

---

# 26. Do Not Over-Validate

The application is a modeling environment.

Do not implement simplistic rules such as:

```text
Carbon can only have exactly 4 bonds.
```

Chemistry includes:

```text
Formal charge
Aromaticity
Hypervalency
Coordination chemistry
Radicals
Multiple bonding
Unusual structures
```

The validation system must distinguish:

```text
Definitely invalid
Potentially unusual
Valid under specific conditions
Unsupported by current engine
```

---

# 27. Validation Severity

Use:

```text
ERROR
WARNING
INFO
```

Example:

```text
ERROR:
Broken bond reference.

WARNING:
Unusual valence detected.

INFO:
Structure contains an aromatic system.
```

---

# 28. Scientific Uncertainty

Never present computational predictions as facts.

Use explicit labels:

```text
USER_DEFINED
COMPUTED
PREDICTED
HYPOTHETICAL
VALIDATED
EXPERIMENTALLY_VERIFIED
UNKNOWN
```

---

# 29. Reaction Prediction

Reaction prediction must never be represented as guaranteed chemistry.

Bad:

```text
Reaction successful.
```

when the system merely generated a prediction.

Good:

```text
Predicted transformation.

Experimental verification required.
```

---

# 30. Reaction Engine

Reaction logic must be isolated from UI.

Use:

```text
ReactionService
ReactionEngine
ReactionPredictor
ReactionDiffEngine
```

Do not implement reaction rules inside:

```text
ReactionEditor.tsx
ReactionViewer.tsx
```

---

# 31. Reaction Mapping

Reactant and product atoms must maintain stable mappings when possible.

Use:

```ts
AtomMapping
```

for:

```text
Reactant Atom
      ↕
Product Atom
```

This is required for reliable reaction animation.

---

# 32. Reaction Difference

The reaction diff engine must detect:

```text
Bond formed
Bond broken
Bond order changed
Charge changed
Atom added
Atom removed
```

Do not compare molecules using only their visual positions.

---

# 33. Reaction Animation

Animation must be based on chemical state.

Correct:

```text
Reactant Coordinates
+
Product Coordinates
+
Atom Mapping
      ↓
Interpolator
      ↓
Renderer
```

Incorrect:

```text
Random animation
```

---

# 34. Reaction Timeline

Reaction animation must support:

```text
Play
Pause
Seek
Restart
Step Forward
Step Backward
```

Animation state must remain separate from the molecular domain.

---

# 35. Do Not Fake Chemistry

Do not create visually impressive animations that imply an actual mechanism when no mechanism has been computed or supplied.

If an animation is merely an interpolation:

```text
Visualization:
Interpolated structural transition
```

Do not label it:

```text
Reaction mechanism
```

unless the mechanism is actually represented.

---

# 36. 3D Rendering

The 3D engine must use:

```text
Three.js
React Three Fiber
Drei where useful
```

Rendering components should remain modular.

---

# 37. Atom Rendering

Atoms should use reusable geometry and materials.

Do not create unnecessary unique resources.

Bad:

```ts
new THREE.SphereGeometry(...)
new THREE.MeshStandardMaterial(...)
```

for every atom.

Prefer:

```text
Shared Geometry
+
Shared Material
```

or:

```text
InstancedMesh
```

for large structures.

---

# 38. Bond Rendering

Bond geometry must be generated from:

```text
Atom A position
Atom B position
Bond order
```

The bond renderer must correctly:

* Calculate midpoint
* Calculate length
* Orient cylinder
* Apply bond representation

---

# 39. Large Molecules

For large structures use:

```text
InstancedMesh
Level of Detail
Shared Geometry
Shared Materials
Reduced Labels
```

Do not render thousands of independent React components unnecessarily.

---

# 40. Performance Rule

Never optimize based purely on intuition.

Use profiling.

Measure:

```text
FPS
Memory
CPU time
GPU time
React render count
Worker execution time
```

Then optimize the actual bottleneck.

---

# 41. React Rendering

Do not cause the entire application to rerender when one atom moves.

Use selective state subscriptions.

Prefer:

```text
Zustand
```

with granular selectors.

---

# 42. Three.js State

Do not store large Three.js objects in Zustand unless there is a specific architectural reason.

Prefer IDs and serializable state.

---

# 43. Raycasting

Selection should resolve:

```text
Three.js Object
      ↓
entityId
      ↓
Domain Entity
```

Example:

```ts
mesh.userData.entityId = atom.id;
```

---

# 44. Selection State

Selection should store IDs:

```ts
selectedAtoms: string[]
selectedBonds: string[]
selectedMolecules: string[]
```

Do not store:

```ts
THREE.Mesh[]
```

as application state.

---

# 45. Transform Controls

Transform controls must update domain state through commands.

Workflow:

```text
Gizmo
 ↓
New Coordinate
 ↓
MoveAtomCommand
 ↓
Molecule Store
 ↓
Renderer
```

Never permanently modify only the visual mesh.

---

# 46. Camera

Camera state is UI/rendering state.

It must not be part of the molecular domain.

---

# 47. Rendering Modes

Rendering modes must be configuration.

Examples:

```text
BALL_AND_STICK
SPACE_FILLING
STICK
WIRE
```

Changing rendering mode must not modify the molecule.

---

# 48. Colors

Element colors must come from a centralized color system.

Example:

```text
ElementColorRegistry
```

User customization should override defaults without modifying the element dataset.

---

# 49. Labels

Labels must be optional.

For large molecules:

```text
Labels OFF
```

should be available to preserve performance.

---

# 50. Measurement

Measurement tools must operate on domain coordinates.

Distance:

```text
distance(atomA, atomB)
```

Angle:

```text
angle(atomA, atomB, atomC)
```

Do not calculate scientific measurements from projected screen coordinates.

---

# 51. Geometry

Initial molecular geometry is not necessarily an optimized geometry.

The UI must distinguish:

```text
Initial Geometry
Optimized Geometry
User-Modified Geometry
Imported Geometry
```

---

# 52. Molecular Optimization

Optimization must be represented as a computation.

Do not move atoms toward a visually pleasing arrangement and call it:

```text
Energy optimized
```

unless an actual optimization algorithm has been executed.

---

# 53. Chemistry Engines

Chemistry engines must be accessed through adapters.

Correct:

```text
ChemistryEngine
      ↓
RDKitAdapter
      ↓
RDKit
```

Incorrect:

```text
UI
 ↓
RDKit API
```

---

# 54. External Dependencies

Do not spread dependency-specific APIs throughout the application.

Bad:

```ts
import RDKit from "...";
```

inside many unrelated files.

Good:

```text
chemistry/adapters/RDKitAdapter.ts
```

---

# 55. Chemistry Engine Interface

All chemistry engines should implement or adapt to a common interface.

Example:

```ts
interface ChemistryEngine {
    validateMolecule(
        molecule: Molecule
    ): ValidationResult;

    generateFormula(
        molecule: Molecule
    ): string;

    analyzeMolecule(
        molecule: Molecule
    ): MolecularAnalysis;
}
```

---

# 56. AI

AI is an optional layer.

AI must never directly mutate:

```text
Zustand
Three.js
Database
```

AI output must first become a structured command.

---

# 57. AI Command Pipeline

Required:

```text
User Prompt
     ↓
AI
     ↓
Structured Command
     ↓
Schema Validation
     ↓
Domain Validation
     ↓
User Confirmation where appropriate
     ↓
Execute Command
```

---

# 58. AI Must Not Bypass Validation

AI-generated structures must pass exactly the same validation pipeline as manually created structures.

No special AI bypass.

---

# 59. AI Hallucination

Never trust AI-generated:

```text
Element properties
Molecular properties
Reaction outcomes
Experimental claims
```

without validation against authoritative data or computational engines.

---

# 60. Database

The database stores persistent scientific/domain data.

It must not store:

```text
Three.js meshes
React component state
Camera instances
WebGL resources
```

---

# 61. Prisma

Prisma belongs to infrastructure.

Do not import Prisma into:

```text
domain/
```

---

# 62. Database Access

Use:

```text
API
 ↓
Application Service
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
```

Do not write database queries directly inside React components.

---

# 63. Repository Pattern

Where persistence abstraction is useful:

```ts
interface MoleculeRepository {
    getById(id: string): Promise<Molecule | null>;

    save(molecule: Molecule): Promise<void>;

    delete(id: string): Promise<void>;
}
```

Infrastructure implements it.

---

# 64. API Routes

API routes should be thin.

Correct:

```text
Route
 ↓
Validate Input
 ↓
Application Service
 ↓
Domain
 ↓
Repository
```

Do not put large chemistry algorithms inside API route handlers.

---

# 65. API Validation

Every external request must be validated.

Use:

```text
Zod
```

Never trust:

```text
Request body
Query parameters
Uploaded files
AI output
External API responses
```

---

# 66. Error Handling

Never silently swallow errors.

Bad:

```ts
try {
   ...
} catch {}
```

Good:

```text
Log
Classify
Recover or surface
```

---

# 67. Error Categories

Use distinct categories:

```text
USER_ERROR
VALIDATION_ERROR
CHEMISTRY_ERROR
IMPORT_ERROR
EXPORT_ERROR
COMPUTATION_ERROR
NETWORK_ERROR
SYSTEM_ERROR
```

---

# 68. User Errors

Errors should explain what the user can do.

Bad:

```text
Invalid operation.
```

Better:

```text
The selected atoms already have a bond.
Choose a different pair of atoms or change the existing bond.
```

---

# 69. Web Workers

Use Web Workers for expensive browser computations.

Suitable:

```text
Large molecule validation
Geometry processing
Analysis
Parsing
```

Do not block the main UI thread.

---

# 70. Worker Communication

Workers should only exchange serializable data.

Do not pass:

```text
React state
DOM nodes
Three.js meshes
```

---

# 71. WASM

WASM integrations must be isolated behind adapters.

Do not expose WASM implementation details to the UI.

---

# 72. Job Queue

Long-running computations should use asynchronous jobs.

States:

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED
```

---

# 73. Job Results

Results must contain:

```text
Job ID
Status
Engine
Engine Version
Input Version
Output
Warnings
Errors
Execution Time
```

Scientific results must be reproducible where practical.

---

# 74. Scientific Reproducibility

For computed results, store:

```text
Engine
Engine Version
Method
Parameters
Input Structure
Timestamp
```

where applicable.

Do not store only the final number.

---

# 75. Import

Imported structures must pass:

```text
File Validation
 ↓
Format Detection
 ↓
Parsing
 ↓
Schema Validation
 ↓
Chemical Validation
 ↓
Normalization
```

before entering the workspace.

---

# 76. Export

Exporters must consume the domain model.

```text
Molecule
 ↓
Exporter
 ↓
File
```

Do not export directly from Three.js meshes.

---

# 77. Serialization

Native project serialization must be:

```text
Deterministic
Versioned
Validated
Serializable
```

---

# 78. Schema Version

Every project must contain:

```json
{
    "schemaVersion": 1
}
```

Never assume the current schema is the only schema.

---

# 79. Migration

When schema changes:

```text
Old Project
    ↓
Migration
    ↓
Current Schema
```

Do not simply reject all older projects.

---

# 80. Autosave

Autosave must be debounced.

Do not write to storage on every mouse movement.

Bad:

```text
Mouse Move
 ↓
Database Write
```

Good:

```text
Mouse Move
 ↓
State Update
 ↓
Debounce
 ↓
Save
```

---

# 81. Local Storage

For local-first functionality, use:

```text
IndexedDB
```

rather than relying on localStorage for large molecular projects.

---

# 82. Offline Mode

The core molecule editor should function without network connectivity where possible.

Offline-capable:

```text
Periodic Table
Atom Creation
Bond Editing
Basic Validation
Basic Analysis
Project Save
Project Load
Export
```

---

# 83. Authentication

Authentication should not be required for basic local molecule construction.

Cloud functionality may require authentication.

---

# 84. Privacy

Do not upload molecular structures to external services without clear user awareness and an appropriate data policy.

Do not send user project data to an AI provider unnecessarily.

---

# 85. External API Calls

External chemistry or AI calls must go through server-side adapters when credentials are required.

Never expose secret API keys to the browser.

---

# 86. Security

Treat all imported files and external responses as untrusted.

Validate:

```text
File type
File size
Structure
JSON
API response
AI output
```

---

# 87. No Arbitrary Code Execution

Imported molecular files must only be parsed.

Never execute file contents.

---

# 88. Frontend Structure

Prefer:

```text
app/
components/
domain/
application/
chemistry/
rendering/
stores/
workers/
```

over a single giant component directory containing all logic.

---

# 89. Component Responsibility

Each React component should have one primary responsibility.

Bad:

```text
MolecularWorkspace.tsx
```

containing:

```text
UI
Chemistry
Database
Reaction Prediction
Three.js
Validation
```

Good:

```text
Workspace
PeriodicTable
MolecularCanvas
Inspector
ReactionEditor
```

with services handling domain logic.

---

# 90. Component Size

If a component becomes difficult to understand, split it.

Large components are not automatically bad, but a component containing unrelated concerns must be decomposed.

---

# 91. TypeScript

Use strict TypeScript.

Required:

```json
{
    "strict": true
}
```

Avoid:

```ts
any
```

unless there is a documented reason.

---

# 92. No Unsafe Casting

Avoid:

```ts
value as SomeType
```

when runtime validation is possible.

Prefer:

```text
Zod
type guards
validated parsers
```

---

# 93. Domain Types

Domain types should be explicit.

Avoid generic:

```ts
Record<string, any>
```

for core molecular structures.

---

# 94. Naming

Use clear names.

Preferred:

```text
MolecularGraph
ReactionEngine
ValidationService
AtomRenderer
BondRenderer
```

Avoid vague names:

```text
Manager
Helper
Thing
Utils2
DataProcessor
```

unless the abstraction is genuinely generic.

---

# 95. File Naming

Use consistent naming.

React components:

```text
PascalCase.tsx
```

Services:

```text
PascalCase.ts
```

Stores:

```text
camelCaseStore.ts
```

Utilities:

```text
camelCase.ts
```

---

# 96. Comments

Comments should explain:

```text
Why
```

not:

```text
What obvious code does
```

Bad:

```ts
// Add atom
addAtom(atom);
```

Good:

```ts
// Atom positions are stored in Å and converted to scene units
// only at the rendering boundary.
```

---

# 97. TODO Rules

Do not leave vague TODOs.

Bad:

```text
TODO: fix this
```

Good:

```text
TODO(#123): Replace approximate geometry generation
with validated conformer generation.
```

---

# 98. Dependencies

Do not add a dependency merely because it makes a small task easier.

Before adding a package:

1. Check whether existing dependencies solve the problem.
2. Check bundle impact.
3. Check maintenance status.
4. Check license.
5. Check browser compatibility.
6. Check security history.

---

# 99. Avoid Premature Abstraction

Do not create five abstraction layers for a problem that does not exist.

But chemistry domain boundaries are mandatory because the platform is expected to integrate multiple engines later.

---

# 100. Avoid Premature Optimization

Do not implement:

```text
GPU compute
WebGPU
complex caching
distributed workers
```

until the relevant feature requires them.

The architecture should allow them without requiring them in MVP.

---

# 101. Performance Budget

The application should target:

```text
~60 FPS
```

for normal molecules.

Interaction latency should feel immediate.

Expensive operations must be asynchronous.

---

# 102. Memory

Always clean up:

```text
Three.js geometries
Three.js materials
textures
render targets
event listeners
workers
```

when no longer needed.

---

# 103. Three.js Disposal

When removing dynamic objects, ensure GPU resources are properly disposed when ownership ends.

Do not blindly dispose shared resources.

Resource ownership must be clear.

---

# 104. Event Listeners

Every manually registered listener must have a cleanup path.

Example:

```text
addEventListener()
      ↓
removeEventListener()
```

---

# 105. Animation Loops

Do not create multiple uncontrolled animation loops.

React Three Fiber should manage the rendering loop wherever practical.

---

# 106. State Updates

Avoid high-frequency global state updates from:

```text
mousemove
pointermove
camera movement
```

Use local/render state when appropriate and commit meaningful changes to the domain state.

---

# 107. Dragging

During atom dragging:

```text
Interactive Visual State
```

may update at high frequency.

At meaningful commit points:

```text
MoveAtomCommand
```

should update persistent molecular state.

---

# 108. Periodic Table Performance

The periodic table is small and can remain fully loaded.

Element details should be derived from the centralized dataset.

---

# 109. Search

Search must be deterministic and predictable.

Support:

```text
Element Name
Symbol
Atomic Number
Molecule Name
Formula
```

---

# 110. Formula Generation

Formula generation must use the molecular graph.

Do not generate formulas from:

```text
visible meshes
```

or:

```text
screen labels
```

---

# 111. Molecular Analysis

Analysis should be reproducible from a molecule snapshot.

Given the same:

```text
Molecular Structure
+
Method
+
Engine Version
```

the result should be reproducible where the underlying engine allows it.

---

# 112. Reaction Analysis

Reaction analysis must compare structured molecular graphs.

Do not rely on:

```text
pixel comparison
```

or:

```text
3D visual similarity
```

to determine chemical changes.

---

# 113. 3D Similarity vs Chemical Similarity

Never assume:

```text
Similar 3D appearance
=
Same molecule
```

and never assume:

```text
Different orientation
=
Different molecule
```

Molecular identity is determined by appropriate chemical representations.

---

# 114. Rotation

Rotating a molecule as a rigid body changes coordinates, not molecular connectivity.

Do not modify:

```text
Atoms
Bonds
```

when the user merely rotates the molecule.

---

# 115. Translation

Moving a molecule in the scene should not alter:

```text
Bond lengths
Bond orders
Connectivity
```

unless the user explicitly edits the molecular structure.

---

# 116. Coordinate Transform

Separate:

```text
Molecular Coordinates
```

from:

```text
Scene Transform
```

where practical.

This allows the same molecule to appear at different workspace locations.

---

# 117. Molecule Instancing

If the same molecule is displayed multiple times, consider:

```text
Shared Molecular Data
+
Separate Scene Transforms
```

rather than duplicating the underlying chemical structure.

---

# 118. Reaction Mixtures

Reactants, reagents, catalysts, and products must have distinct semantic roles.

Do not represent everything as:

```text
Molecule[]
```

without context.

---

# 119. Reaction Conditions

Conditions such as:

```text
Temperature
Pressure
Solvent
Duration
Atmosphere
```

are metadata unless the selected computational engine actually uses them.

Do not imply that entering a temperature automatically simulates chemistry.

---

# 120. Mechanism Visualization

A mechanism must only be displayed when the underlying data represents mechanistic steps.

Otherwise label it:

```text
Structural Transition Visualization
```

---

# 121. Experimental Claims

The application must never claim:

```text
"This molecule can definitely be synthesized."
```

based solely on:

```text
3D geometry
Rule-based generation
AI output
```

Use:

```text
Hypothetical
Predicted
Computationally generated
```

where appropriate.

---

# 122. Chemical Safety

The platform may model chemical structures, but the application must not imply that a generated structure is safe to handle.

Where relevant, clearly distinguish:

```text
Molecular Modeling
```

from:

```text
Experimental Handling
```

---

# 123. Testing

Every domain feature must have tests.

Minimum:

```text
Unit Tests
Integration Tests
E2E Tests
```

where applicable.

---

# 124. Domain Test Priority

Highest priority:

```text
MolecularGraph
Bond Validation
Formula Engine
Reaction Diff
Serialization
```

These are more important than superficial UI tests.

---

# 125. Test Independence

Domain tests must not require:

```text
Browser
DOM
Three.js
```

---

# 126. Golden Molecular Structures

Maintain a small set of known test structures.

Examples:

```text
H2
H2O
CO2
CH4
NH3
C2H4
C2H6
C6H6
```

Use these for regression testing.

---

# 127. Regression Testing

Whenever chemistry logic changes, test existing structures.

A change to:

```text
ValenceEngine
FormulaEngine
MolecularGraph
```

must trigger relevant regression tests.

---

# 128. Import Tests

Maintain sample files for:

```text
JSON
XYZ
MOL
SDF
SMILES
```

where supported.

---

# 129. Export Tests

Verify:

```text
Molecule
 ↓
Export
 ↓
Import
 ↓
Equivalent Molecular Structure
```

where the format supports lossless representation.

---

# 130. E2E Test

At minimum, test:

```text
Open Application
 ↓
Select Element
 ↓
Add Atom
 ↓
Add Second Atom
 ↓
Create Bond
 ↓
Inspect Molecule
 ↓
Save
 ↓
Reload
```

---

# 131. Reaction E2E

Test:

```text
Create Reactant
 ↓
Create Product
 ↓
Define Reaction
 ↓
Calculate Bond Changes
 ↓
Play Animation
```

---

# 132. Accessibility

All controls must have:

```text
Accessible names
Keyboard interaction
Focus states
```

Do not make critical functionality mouse-only.

---

# 133. Keyboard Shortcuts

Maintain a centralized shortcut registry.

Example:

```text
V → Select
A → Add Atom
B → Bond
M → Move
R → Rotate
D → Delete
F → Focus
Space → Play/Pause
Ctrl/Cmd+Z → Undo
```

Do not hard-code shortcuts across unrelated components.

---

# 134. Responsive Design

Desktop is the primary target.

Do not allow responsive layouts to destroy the central 3D workspace.

On small screens:

```text
Panels → drawers/sheets
Inspector → bottom sheet
Periodic Table → modal
```

---

# 135. UI State

UI state must not be confused with molecular state.

Examples of UI state:

```text
activePanel
activeTool
sidebarOpen
theme
modalOpen
```

Molecular state:

```text
atoms
bonds
coordinates
charge
```

Keep them separate.

---

# 136. Loading

Long-running operations must show progress.

Example:

```text
Preparing structure...
Validating...
Generating geometry...
Analyzing...
```

Never leave the user staring at an apparently frozen interface.

---

# 137. Cancellation

Long-running jobs should support cancellation when practical.

Example:

```text
Running...
[ Cancel ]
```

Cancellation must clean up worker/job resources.

---

# 138. Network Failure

The UI must handle:

```text
Offline
Timeout
Server Error
Engine Unavailable
```

without losing local molecular state.

---

# 139. Autosave Recovery

If the browser crashes or reloads unexpectedly, the application should attempt to recover the latest local workspace snapshot.

---

# 140. Logging

Logs must be useful for debugging.

Include:

```text
operation
entityId
duration
status
errorCode
```

Do not log entire molecular structures unless necessary.

---

# 141. Sensitive Data

Do not log:

```text
authentication tokens
API keys
passwords
private credentials
```

---

# 142. Documentation

Every major domain service must have documentation explaining:

```text
Purpose
Inputs
Outputs
Failure modes
Units
Scientific assumptions
```

---

# 143. Scientific Assumptions

Whenever a computation uses an approximation, document it.

Example:

```text
This geometry is an initial approximate structure
and has not been energy optimized.
```

---

# 144. No Fake Precision

Do not display:

```text
1.423817293817 Å
```

if the underlying calculation only supports approximate precision.

Display scientifically appropriate precision.

---

# 145. Data Provenance

Where scientific data comes from an external source, retain:

```text
Source
Version
Date
Method
```

where practical.

---

# 146. External Engine Versioning

Record engine versions for computational results.

Example:

```text
Engine: ExampleChemistryEngine
Version: X.Y.Z
Method: ...
```

---

# 147. Feature Flags

Advanced functionality must be feature-flagged where necessary.

Examples:

```text
ENABLE_SMILES
ENABLE_RDKIT
ENABLE_OPENBABEL
ENABLE_REACTION_PREDICTION
ENABLE_AI
ENABLE_WEBGPU
ENABLE_QUANTUM
```

---

# 148. MVP Discipline

Do not implement advanced features before the core molecule editor is stable.

Required order:

```text
3D Engine
 ↓
Periodic Table
 ↓
Atom System
 ↓
Bond System
 ↓
Molecular Graph
 ↓
Validation
 ↓
Analysis
 ↓
Persistence
 ↓
Reaction System
 ↓
Advanced Chemistry
 ↓
AI
```

---

# 149. No Premature Quantum Chemistry

Do not implement a quantum chemistry engine inside the initial web application.

Use an external/isolated computation layer when required.

---

# 150. No Premature Distributed Architecture

Do not introduce:

```text
Kubernetes
Microservices
Kafka
Multiple databases
```

without a demonstrated requirement.

Start with a modular monolith.

---

# 151. Recommended Architecture

Initial application:

```text
Next.js
+
PostgreSQL
+
Prisma
+
Zustand
+
Three.js
+
React Three Fiber
+
Chemistry Domain
```

Future computation can be separated into workers.

---

# 152. Modular Monolith First

The initial backend should be a modular monolith.

Logical modules:

```text
Elements
Molecules
Reactions
Analysis
Validation
Projects
Jobs
```

They may later become independent services if scale requires it.

---

# 153. Avoid Microservice Overengineering

Do not create:

```text
element-service
molecule-service
bond-service
reaction-service
```

as separate deployments for MVP.

That adds operational complexity without solving the initial problem.

---

# 154. Database Transactions

Use transactions for operations that must remain atomic.

Example:

```text
Create Molecule
+
Create Atoms
+
Create Bonds
```

should not leave a partially persisted molecule if the operation fails.

---

# 155. Concurrency

Cloud project editing must account for concurrent updates in future collaborative versions.

MVP does not require full collaboration.

---

# 156. Project Ownership

Cloud projects must always enforce authorization.

A user must only be able to:

```text
Read
Write
Delete
```

projects they are authorized to access.

---

# 157. API Authorization

Authentication alone is insufficient.

Every project-level API request must also verify authorization.

---

# 158. File Size Limits

Imported files must have reasonable size limits.

Large structures should use asynchronous processing.

---

# 159. Resource Limits

Expensive computational jobs must have:

```text
Timeout
Memory limit
Input size limit
Queue priority
Cancellation
```

where applicable.

---

# 160. Prevent Denial of Service

Do not allow users to submit unlimited:

```text
Quantum jobs
Reaction predictions
Huge molecular files
```

without resource controls.

---

# 161. Code Review Checklist

Before merging code verify:

```text
[ ] Domain remains renderer independent
[ ] No unnecessary Three.js state
[ ] No chemistry logic in UI
[ ] TypeScript strict
[ ] Input validation exists
[ ] Errors handled
[ ] Tests added
[ ] Units explicit
[ ] Scientific assumptions documented
[ ] No security issues
[ ] Performance impact checked
```

---

# 162. Agent Workflow

A coding agent must follow this workflow:

```text
Understand Requirement
        ↓
Inspect Architecture
        ↓
Identify Domain Boundary
        ↓
Plan Change
        ↓
Implement
        ↓
Typecheck
        ↓
Lint
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Build
        ↓
Review
```

Do not immediately start editing files without understanding the architecture.

---

# 163. Agent Must Inspect Existing Code

Before modifying a subsystem:

1. Locate the existing implementation.
2. Read related types.
3. Read related services.
4. Identify dependencies.
5. Determine current data flow.
6. Modify the smallest appropriate boundary.

Do not create duplicate implementations.

---

# 164. Agent Must Reuse Existing Logic

Before implementing a new utility, search the repository.

Do not create:

```text
calculateDistance()
calculateDistance2()
distanceHelper()
distanceUtils()
```

when one implementation already exists.

---

# 165. Agent Must Not Rewrite Unrelated Code

A feature change should not trigger a broad refactor unless the architecture requires it.

Avoid unnecessary changes to unrelated files.

---

# 166. Agent Must Not Delete Working Features

Do not remove existing functionality merely because a new implementation is cleaner.

If replacement is required:

```text
Implement
Test
Migrate
Remove
```

---

# 167. Agent Must Preserve Public Interfaces

Do not arbitrarily change:

```text
API contracts
Project format
Domain interfaces
```

without updating all consumers and documentation.

---

# 168. Agent Must Update Documentation

When architecture changes materially:

```text
architecture.md
prd.md
rules.md
```

must be reviewed.

Do not allow implementation and documentation to diverge.

---

# 169. Agent Must Run Validation

After meaningful code changes:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

where those scripts exist.

---

# 170. Agent Must Fix Root Causes

Do not hide errors with:

```text
@ts-ignore
eslint-disable
any
empty catch
```

unless there is a documented and justified reason.

---

# 171. No TypeScript Suppression as a Shortcut

Avoid:

```ts
// @ts-ignore
```

Prefer correcting:

```text
Types
Interfaces
Schemas
Runtime validation
```

---

# 172. No Silent Fallbacks

Do not silently replace failed chemistry computations with fake values.

Bad:

```text
Calculation failed
 ↓
Return 0
```

Good:

```text
Calculation failed
 ↓
Return structured error
```

---

# 173. No Fake Data in Production

Mock chemistry data is acceptable for development.

It must never silently appear as real scientific data in production.

---

# 174. Demo Mode

If demo data is used:

```text
DEMO
```

must be clearly identifiable.

---

# 175. Scientific Labels

Use clear terminology.

Prefer:

```text
Predicted
Computed
Approximate
Hypothetical
User-defined
```

Avoid misleading:

```text
Guaranteed
Proven
Synthesized
Safe
Stable
```

unless supported by appropriate evidence.

---

# 176. Final Architectural Rules

The following rules are absolute:

```text
1. Molecular graph is the source of truth.

2. Three.js is a renderer, not the chemistry model.

3. Chemistry logic must remain framework independent.

4. UI components must not contain chemistry algorithms.

5. Database code must remain outside the domain.

6. All molecular mutations must be structured operations.

7. Undo/redo must cover meaningful editing operations.

8. All physical quantities require explicit units.

9. Imported data must be validated.

10. AI output must be validated.

11. Predicted chemistry must not be presented as experimentally verified.

12. Expensive computations must not block the UI thread.

13. Large molecular scenes must use rendering optimizations.

14. Three.js resources must be managed and disposed correctly.

15. Project files must be versioned.

16. External chemistry engines must be accessed through adapters.

17. Scientific results must retain provenance where practical.

18. Do not introduce unnecessary microservices.

19. Do not sacrifice scientific correctness for visual effects.

20. Do not sacrifice the molecular domain model for frontend convenience.
```

---

# 177. Final Development Philosophy

AtomSynthesizer must be developed as:

```text
A Chemistry Platform
        +
A Molecular Graph System
        +
A High-Performance 3D Renderer
        +
A Reaction Visualization System
```

not merely:

```text
A 3D website with atoms.
```

The architecture must allow the project to evolve from:

```text
Interactive Molecule Builder
```

into:

```text
Molecular Modeling Platform
        ↓
Reaction Analysis Platform
        ↓
Computational Chemistry Interface
        ↓
AI-Assisted Molecular Design Platform
```

without rewriting the core molecular representation.

The most important engineering invariant is:

```text
                ┌──────────────────┐
                │ Molecular Domain │
                │                  │
                │ Atom             │
                │ Bond             │
                │ Molecule         │
                │ Reaction         │
                └────────┬─────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       Visualization             Chemistry
             │                       │
         Three.js             RDKit / Engines
             │                       │
             ▼                       ▼
          Browser                Compute
```

Both visualization and computation consume the same authoritative molecular model.

Neither is allowed to redefine it.

That separation is the foundation of the entire AtomSynthesizer platform.
