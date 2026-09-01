# AtomSynthesizer — Architecture Document

**Project:** AtomSynthesizer
**Document:** `architecture.md`
**Version:** 1.0.0
**Status:** Architecture Specification
**Frontend:** Next.js + React + TypeScript
**3D Engine:** Three.js + React Three Fiber
**State:** Zustand
**Database:** PostgreSQL + Prisma
**Package Manager:** pnpm

---

# 1. Architecture Overview

AtomSynthesizer is designed as a modular scientific visualization and molecular modeling platform.

The architecture must separate:

```text
User Interface
      ↓
Application Services
      ↓
Chemistry Domain
      ↓
Infrastructure
```

The 3D renderer is a visualization layer and must never become the source of chemical truth.

The fundamental architecture is:

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │   Application UI    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Application Layer │
                         │   Commands/Services │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Domain Layer     │
                         │ Molecular Chemistry │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   ▼                ▼                ▼
             ┌───────────┐    ┌───────────┐   ┌────────────┐
             │ Chemistry │    │ Persistence│   │   Export   │
             │  Engines  │    │   Layer    │   │   Layer    │
             └───────────┘    └───────────┘   └────────────┘
```

---

# 2. Core Architectural Principle

The most important rule:

```text
Chemical State
      ≠
Rendering State
```

Correct:

```text
Molecule
   │
   ├── Atom
   ├── Atom
   └── Bond
        │
        ▼
   Renderer
        │
        ▼
    Three.js
```

Incorrect:

```text
Three.js Object
      ↓
Chemical Model
```

Three.js objects are disposable visual representations.

The molecular graph is the authoritative representation.

---

# 3. Architectural Layers

The system is divided into seven primary layers.

```text
┌──────────────────────────────────────────────┐
│                  UI Layer                    │
├──────────────────────────────────────────────┤
│             Visualization Layer              │
├──────────────────────────────────────────────┤
│              Application Layer               │
├──────────────────────────────────────────────┤
│                Domain Layer                  │
├──────────────────────────────────────────────┤
│              Chemistry Layer                 │
├──────────────────────────────────────────────┤
│            Infrastructure Layer              │
├──────────────────────────────────────────────┤
│               Persistence                    │
└──────────────────────────────────────────────┘
```

---

# 4. UI Layer

Responsible for:

* Panels
* Toolbars
* Menus
* Forms
* Inspector
* Periodic table
* Reaction editor
* Analysis panels
* Dialogs
* User interaction

Technology:

```text
React
Next.js
TypeScript
Tailwind
shadcn/ui
Radix
Lucide
```

The UI must not directly manipulate Three.js objects.

---

# 5. Visualization Layer

Responsible for:

* 3D scene
* Atoms
* Bonds
* Molecules
* Camera
* Lighting
* Selection visualization
* Transform controls
* Measurement visualization
* Reaction animations

Technology:

```text
Three.js
React Three Fiber
Drei
```

The visualization layer receives domain state.

Example:

```text
Molecule
    ↓
MolecularRenderer
    ↓
AtomRenderer
BondRenderer
    ↓
Three.js
```

---

# 6. Application Layer

The application layer coordinates user actions.

Examples:

```text
CreateAtom
DeleteAtom
MoveAtom
CreateBond
DeleteBond
ChangeBondOrder
CreateMolecule
CreateReaction
RunValidation
ImportMolecule
ExportMolecule
```

This layer should contain application workflows but not low-level rendering logic.

---

# 7. Domain Layer

The domain layer represents the actual chemistry model.

Core entities:

```text
Element
Atom
Bond
Molecule
Reaction
Measurement
MolecularAnalysis
ValidationResult
```

The domain layer must not import:

```text
React
Three.js
React Three Fiber
Next.js
DOM APIs
```

This makes the chemistry system independently testable.

---

# 8. Chemistry Layer

The chemistry layer provides computational functionality.

Responsibilities:

* Molecular validation
* Formula generation
* Molecular descriptors
* Geometry processing
* SMILES parsing
* Molecular format conversion
* Reaction processing
* Reaction comparison
* External chemistry engine integration

---

# 9. Infrastructure Layer

Infrastructure contains implementation-specific systems:

```text
Database
File System
External APIs
Chemistry Engines
Job Queue
Authentication
Storage
Logging
```

Infrastructure must communicate with the domain through interfaces.

---

# 10. Recommended Project Structure

```text
atomsynthesizer/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── workspace/
│   │   └── page.tsx
│   │
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── elements/
│       ├── molecules/
│       ├── reactions/
│       ├── analysis/
│       ├── validation/
│       ├── projects/
│       ├── jobs/
│       └── export/
│
├── components/
│   │
│   ├── workspace/
│   │   ├── Workspace.tsx
│   │   ├── WorkspaceToolbar.tsx
│   │   ├── WorkspaceCanvas.tsx
│   │   └── WorkspaceStatus.tsx
│   │
│   ├── molecular/
│   │   ├── MolecularCanvas.tsx
│   │   ├── MoleculeRenderer.tsx
│   │   ├── AtomRenderer.tsx
│   │   ├── BondRenderer.tsx
│   │   ├── SelectionRenderer.tsx
│   │   ├── MeasurementRenderer.tsx
│   │   └── MolecularLabels.tsx
│   │
│   ├── periodic-table/
│   │   ├── PeriodicTable.tsx
│   │   ├── ElementTile.tsx
│   │   ├── ElementSearch.tsx
│   │   └── ElementDetails.tsx
│   │
│   ├── inspector/
│   │   ├── Inspector.tsx
│   │   ├── AtomInspector.tsx
│   │   ├── BondInspector.tsx
│   │   ├── MoleculeInspector.tsx
│   │   └── ReactionInspector.tsx
│   │
│   ├── reaction/
│   │   ├── ReactionEditor.tsx
│   │   ├── ReactionTimeline.tsx
│   │   ├── ReactionViewer.tsx
│   │   └── ReactionChanges.tsx
│   │
│   ├── analysis/
│   │   ├── MolecularAnalysis.tsx
│   │   ├── StructureAnalysis.tsx
│   │   └── ValidationPanel.tsx
│   │
│   └── ui/
│
├── domain/
│   │
│   ├── elements/
│   │   ├── Element.ts
│   │   ├── ElementRepository.ts
│   │   └── ElementTypes.ts
│   │
│   ├── molecular/
│   │   ├── Atom.ts
│   │   ├── Bond.ts
│   │   ├── Molecule.ts
│   │   ├── MolecularGraph.ts
│   │   └── MolecularTypes.ts
│   │
│   ├── reaction/
│   │   ├── Reaction.ts
│   │   ├── ReactionStep.ts
│   │   ├── AtomMapping.ts
│   │   └── BondChange.ts
│   │
│   ├── analysis/
│   │   ├── MolecularAnalysis.ts
│   │   └── Descriptors.ts
│   │
│   └── validation/
│       ├── ValidationResult.ts
│       └── ValidationSeverity.ts
│
├── application/
│   │
│   ├── commands/
│   │   ├── AddAtomCommand.ts
│   │   ├── DeleteAtomCommand.ts
│   │   ├── MoveAtomCommand.ts
│   │   ├── CreateBondCommand.ts
│   │   ├── DeleteBondCommand.ts
│   │   └── ChangeBondCommand.ts
│   │
│   ├── services/
│   │   ├── MoleculeService.ts
│   │   ├── ReactionService.ts
│   │   ├── ValidationService.ts
│   │   ├── AnalysisService.ts
│   │   ├── ImportService.ts
│   │   └── ExportService.ts
│   │
│   └── workflows/
│       ├── BuildMolecule.ts
│       ├── CreateReaction.ts
│       └── RunAnalysis.ts
│
├── chemistry/
│   │
│   ├── core/
│   │   ├── ChemistryEngine.ts
│   │   ├── ValenceEngine.ts
│   │   ├── FormulaEngine.ts
│   │   └── GeometryEngine.ts
│   │
│   ├── parsers/
│   │   ├── SmilesParser.ts
│   │   ├── XYZParser.ts
│   │   ├── MolParser.ts
│   │   └── SDFParser.ts
│   │
│   ├── exporters/
│   │   ├── JsonExporter.ts
│   │   ├── XYZExporter.ts
│   │   ├── MolExporter.ts
│   │   └── SmilesExporter.ts
│   │
│   └── adapters/
│       ├── RDKitAdapter.ts
│       ├── OpenBabelAdapter.ts
│       └── QuantumEngineAdapter.ts
│
├── rendering/
│   │
│   ├── scene/
│   │   ├── SceneManager.ts
│   │   ├── CameraManager.ts
│   │   └── LightingManager.ts
│   │
│   ├── atoms/
│   │   ├── AtomMeshFactory.ts
│   │   └── AtomMaterialFactory.ts
│   │
│   ├── bonds/
│   │   ├── BondMeshFactory.ts
│   │   └── BondMaterialFactory.ts
│   │
│   └── animation/
│       ├── ReactionAnimator.ts
│       └── Interpolator.ts
│
├── stores/
│   ├── workspaceStore.ts
│   ├── moleculeStore.ts
│   ├── reactionStore.ts
│   ├── selectionStore.ts
│   ├── uiStore.ts
│   └── historyStore.ts
│
├── data/
│   ├── elements.json
│   ├── elementCategories.json
│   └── reactionTemplates.json
│
├── lib/
│   ├── ids.ts
│   ├── math.ts
│   ├── units.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── workers/
│   ├── validation.worker.ts
│   ├── geometry.worker.ts
│   └── analysis.worker.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── public/
```

---

# 11. Domain Model

## 11.1 Element

An element is immutable reference data.

```ts
interface Element {
    atomicNumber: number;
    symbol: string;
    name: string;

    atomicMass: number;

    group?: number;
    period: number;
    block?: string;

    category: string;

    electronegativity?: number;
    covalentRadius?: number;
    vanDerWaalsRadius?: number;

    commonOxidationStates: number[];

    typicalValence: number[];
}
```

Elements should not be duplicated for every atom.

Atoms reference an element using:

```text
atomicNumber
```

or:

```text
elementId
```

---

# 12. Atom Entity

```ts
interface Atom {
    id: string;

    element: number;

    position: Vector3D;

    charge: number;

    isotope?: number;

    moleculeId: string;

    metadata?: AtomMetadata;
}
```

Example:

```json
{
    "id": "atom_01",
    "element": 6,
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "charge": 0,
    "moleculeId": "mol_01"
}
```

---

# 13. Bond Entity

```ts
interface Bond {
    id: string;

    atomA: string;

    atomB: string;

    order: 1 | 2 | 3 | 1.5;

    type: BondType;

    aromatic?: boolean;
}
```

The bond references atoms by ID.

---

# 14. Molecular Graph

The molecular graph is the central domain structure.

```text
             Atom
            /    \
         Bond    Bond
         /          \
      Atom          Atom
         \
          Bond
           \
           Atom
```

Implementation:

```ts
interface MolecularGraph {
    atoms: Map<string, Atom>;
    bonds: Map<string, Bond>;
}
```

The graph should provide:

```ts
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

---

# 15. Molecule Entity

```ts
interface Molecule {
    id: string;

    name?: string;

    graph: MolecularGraph;

    charge: number;

    multiplicity: number;

    coordinates: CoordinateSystem;

    metadata: MoleculeMetadata;
}
```

---

# 16. Coordinate System

Coordinates should be represented separately from the molecular graph.

```ts
interface Coordinate {
    atomId: string;

    x: number;
    y: number;
    z: number;
}
```

This allows:

```text
Same molecular graph
       +
Different conformations
```

---

# 17. Conformation

A molecule may have multiple conformations.

```ts
interface MolecularConformation {
    id: string;

    moleculeId: string;

    coordinates: Coordinate[];

    energy?: number;

    method?: string;
}
```

This is important for future molecular optimization.

---

# 18. Reaction Entity

```ts
interface Reaction {
    id: string;

    reactants: string[];

    reagents?: string[];

    catalysts?: string[];

    products: string[];

    conditions?: ReactionConditions;

    atomMapping?: AtomMapping[];

    bondChanges?: BondChange[];

    status: ReactionStatus;
}
```

---

# 19. Reaction Conditions

```ts
interface ReactionConditions {
    temperature?: number;
    pressure?: number;

    solvent?: string;

    duration?: number;

    atmosphere?: string;
}
```

These values are metadata unless a computational engine explicitly uses them.

---

# 20. Bond Changes

```ts
interface BondChange {
    type:
        | "FORMED"
        | "BROKEN"
        | "ORDER_CHANGED";

    atomA: string;

    atomB: string;

    oldOrder?: number;

    newOrder?: number;
}
```

---

# 21. Atom Mapping

Atom mapping preserves atom identity across reaction states.

```ts
interface AtomMapping {
    reactantAtomId: string;

    productAtomId: string;
}
```

This enables reaction animation.

---

# 22. Reaction State Machine

Reaction lifecycle:

```text
DRAFT
  ↓
VALIDATING
  ↓
READY
  ↓
RUNNING
  ↓
RESULT
  ↓
REVIEWED
```

Possible failure:

```text
RUNNING
   ↓
FAILED
```

---

# 23. Workspace State

The workspace state should be centralized.

```ts
interface WorkspaceState {
    activeTool: WorkspaceTool;

    molecules: Record<string, Molecule>;

    selectedAtoms: string[];

    selectedBonds: string[];

    selectedMolecules: string[];

    activeElement?: number;

    reaction?: Reaction;

    rendering: RenderingSettings;

    camera: CameraSettings;
}
```

---

# 24. State Separation

Separate state into:

```text
Domain State
UI State
Rendering State
History State
```

Example:

```text
Molecule Store
Selection Store
UI Store
Rendering Store
History Store
```

Do not create one giant global store.

---

# 25. Zustand Architecture

Recommended structure:

```ts
useMoleculeStore()
useSelectionStore()
useWorkspaceStore()
useReactionStore()
useUIStore()
useHistoryStore()
```

Each store should expose actions rather than allowing arbitrary mutation.

---

# 26. Command Architecture

All destructive or reversible molecular operations should use commands.

Example:

```ts
interface Command {
    execute(): void;
    undo(): void;
}
```

Commands:

```text
AddAtomCommand
DeleteAtomCommand
MoveAtomCommand
CreateBondCommand
DeleteBondCommand
ChangeBondOrderCommand
ChangeChargeCommand
```

---

# 27. Command Flow

```text
User Action
    ↓
Command
    ↓
Domain Mutation
    ↓
Validation
    ↓
Store Update
    ↓
Renderer Update
```

---

# 28. Undo / Redo

History:

```text
Command 1
Command 2
Command 3
Command 4
```

Undo:

```text
Command 4 ← removed
Command 3
Command 2
Command 1
```

Redo should reapply the command.

---

# 29. Rendering Architecture

Rendering should use a unidirectional flow.

```text
Molecular State
      ↓
Render Adapter
      ↓
Renderable Molecular Model
      ↓
Three.js
```

---

# 30. Render Adapter

The renderer should convert domain objects to render objects.

Example:

```ts
interface RenderAtom {
    id: string;

    position: Vector3D;

    radius: number;

    color: ColorValue;
}
```

The renderer must not mutate the domain atom directly.

---

# 31. Atom Rendering

Each atom should be rendered using:

```text
Sphere Geometry
+
Element Material
+
Optional Label
```

For large structures use:

```text
InstancedMesh
```

instead of creating independent meshes for every atom.

---

# 32. Bond Rendering

Bonds should be generated from two atom coordinates.

```text
Atom A
   │
   │
Cylinder
   │
   │
Atom B
```

The cylinder must automatically:

* Position itself
* Orient toward Atom B
* Scale to bond length

---

# 33. Multiple Bond Rendering

Double bond:

```text
║
```

Triple bond:

```text
≡
```

Aromatic bonds should use an appropriate visual convention.

---

# 34. Selection Architecture

Selection is separate from molecule data.

```text
User Click
   ↓
Raycaster
   ↓
Object ID
   ↓
Selection Store
   ↓
Visual Highlight
```

Three.js object references should not be stored as application state.

Store IDs instead.

---

# 35. Raycasting

The renderer should map:

```text
Three.js Object
      ↓
domainObjectId
```

Example:

```ts
mesh.userData.entityId = atom.id;
```

Selection then resolves the ID against the molecular store.

---

# 36. Transform Architecture

Moving an atom:

```text
Transform Gizmo
      ↓
New Position
      ↓
MoveAtomCommand
      ↓
Molecule Store
      ↓
Validation
      ↓
Renderer
```

Do not directly change the mesh position without updating domain state.

---

# 37. Periodic Table Architecture

Element data should live in:

```text
data/elements.json
```

The periodic table UI consumes the data.

```text
elements.json
     ↓
Element Repository
     ↓
Periodic Table
```

---

# 38. Element Repository

```ts
interface ElementRepository {
    getByAtomicNumber(
        atomicNumber: number
    ): Element;

    getBySymbol(
        symbol: string
    ): Element;

    search(
        query: string
    ): Element[];
}
```

---

# 39. Chemistry Engine Interface

The application must abstract chemistry engines.

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

    parseStructure?(
        input: string
    ): Molecule;

    generateStructure?(
        molecule: Molecule
    ): Coordinate[];

    predictReaction?(
        input: ReactionInput
    ): ReactionPrediction;
}
```

---

# 40. Chemistry Engine Adapters

```text
ChemistryEngine
       │
       ├── BasicEngine
       ├── RDKitAdapter
       ├── OpenBabelAdapter
       ├── ForceFieldAdapter
       └── QuantumAdapter
```

The application should depend on the interface, not the implementation.

---

# 41. Basic Chemistry Engine

The MVP engine should handle:

* Element lookup
* Formula calculation
* Basic valence validation
* Bond validation
* Molecular graph operations
* Basic descriptors

It should not pretend to perform quantum chemistry.

---

# 42. RDKit Integration

RDKit can eventually handle:

* Molecular parsing
* SMILES
* Molecular descriptors
* Fingerprints
* Chemical validation
* Substructure operations
* Reaction representations

Architecture:

```text
AtomSynthesizer
      ↓
RDKitAdapter
      ↓
RDKit
```

---

# 43. Open Babel Integration

Open Babel can provide:

* Format conversion
* Molecular file parsing
* Coordinate handling
* Structure conversion

Architecture:

```text
ImportService
      ↓
OpenBabelAdapter
      ↓
Open Babel
```

---

# 44. Quantum Chemistry Architecture

Quantum chemistry should never run directly inside the main browser thread.

Use:

```text
Frontend
   ↓
API
   ↓
Job Manager
   ↓
Compute Worker
   ↓
Quantum Engine
```

---

# 45. Job Architecture

Jobs should have:

```ts
interface ComputeJob {
    id: string;

    type: JobType;

    status: JobStatus;

    input: unknown;

    output?: unknown;

    error?: string;

    createdAt: Date;

    completedAt?: Date;
}
```

---

# 46. Job Queue

Future infrastructure:

```text
Redis
+
BullMQ
```

Architecture:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Chemistry Engine
 ↓
Database
```

---

# 47. Web Worker Architecture

Browser-safe computations:

```text
Main Thread
     │
     ├── UI
     └── Renderer
          │
          │
     Web Worker
          │
          ├── Validation
          ├── Geometry
          └── Analysis
```

---

# 48. Worker Rules

Workers must:

* Receive serializable data
* Return serializable results
* Never manipulate DOM
* Never access React state directly
* Never access Three.js objects

---

# 49. Import Architecture

Import pipeline:

```text
File
 ↓
Format Detection
 ↓
Parser
 ↓
Molecular Graph
 ↓
Validation
 ↓
Coordinate Processing
 ↓
Molecule
 ↓
Workspace
```

---

# 50. Import Interfaces

```ts
interface MolecularParser {
    canParse(input: File): boolean;

    parse(input: File): Promise<Molecule>;
}
```

---

# 51. Export Architecture

```text
Molecule
 ↓
Exporter
 ↓
Format
 ↓
File
```

Example:

```ts
interface MolecularExporter {
    export(
        molecule: Molecule
    ): string | Blob;
}
```

---

# 52. Supported Formats

Priority:

```text
JSON
XYZ
MOL
SDF
SMILES
MOL2
PDB
```

Native AtomSynthesizer format:

```text
.atomx
```

may be introduced later.

---

# 53. Native Project Format

Recommended:

```json
{
    "version": "1.0",
    "project": {
        "id": "project_01",
        "name": "Example"
    },
    "molecules": [],
    "reactions": [],
    "settings": {}
}
```

The format must be versioned.

---

# 54. Database Architecture

PostgreSQL should store persistent application data.

High-level:

```text
PostgreSQL
│
├── Users
├── Projects
├── Molecules
├── Reactions
├── Jobs
└── Analysis
```

---

# 55. Database Principle

Do not store Three.js state.

Store:

```text
Atoms
Bonds
Coordinates
Molecular metadata
Reaction data
```

---

# 56. Suggested Database Relations

```text
User
 │
 └── Project
       │
       ├── Molecule
       │     ├── Atom
       │     └── Bond
       │
       └── Reaction
             ├── Reactants
             └── Products
```

---

# 57. Prisma

Prisma should provide the database abstraction.

Example conceptual model:

```prisma
model Project {
    id        String   @id
    name      String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    molecules Molecule[]
    reactions Reaction[]
}
```

The exact schema should follow the domain model rather than forcing the domain model to follow Prisma.

---

# 58. API Architecture

API routes should be thin.

```text
HTTP Request
     ↓
Schema Validation
     ↓
Application Service
     ↓
Domain
     ↓
Infrastructure
     ↓
Response
```

Do not place chemistry algorithms directly inside route handlers.

---

# 59. API Validation

Use:

```text
Zod
```

Every external input must be validated.

Examples:

```text
CreateMoleculeSchema
CreateAtomSchema
CreateBondSchema
CreateReactionSchema
ImportMoleculeSchema
```

---

# 60. API Endpoints

## Elements

```text
GET /api/elements
GET /api/elements/:atomicNumber
```

## Molecules

```text
GET    /api/molecules
POST   /api/molecules
GET    /api/molecules/:id
PUT    /api/molecules/:id
DELETE /api/molecules/:id
```

## Reactions

```text
GET  /api/reactions
POST /api/reactions
GET  /api/reactions/:id
POST /api/reactions/:id/validate
POST /api/reactions/:id/analyze
```

## Analysis

```text
POST /api/analysis/molecule
POST /api/analysis/reaction
```

## Jobs

```text
GET    /api/jobs/:id
POST   /api/jobs
DELETE /api/jobs/:id
```

---

# 61. Reaction Processing Architecture

```text
Reaction Input
      ↓
Normalize
      ↓
Validate Reactants
      ↓
Map Atoms
      ↓
Reaction Engine
      ↓
Generate Product
      ↓
Validate Product
      ↓
Calculate Bond Changes
      ↓
Return Reaction Result
```

---

# 62. Reaction Prediction Boundary

Reaction prediction must be an independent service.

```text
ReactionService
       ↓
ReactionPredictor
       ↓
Prediction Engine
```

Potential implementations:

```text
Rule-Based Predictor
ML Predictor
External API
Research Model
```

This allows multiple prediction engines.

---

# 63. Reaction Confidence

Prediction output:

```ts
interface ReactionPrediction {
    products: Molecule[];

    confidence?: number;

    status:
        | "PREDICTED"
        | "VALIDATED"
        | "UNKNOWN";

    warnings: string[];
}
```

The UI must clearly distinguish prediction from experimental verification.

---

# 64. Reaction Animation Architecture

Reaction animation is based on state interpolation.

```text
Reactant State
      ↓
Transition State
      ↓
Product State
```

Atom mapping determines correspondence.

---

# 65. Animation Pipeline

```text
Reactant Coordinates
       +
Product Coordinates
       +
Atom Mapping
       ↓
Interpolator
       ↓
Animation Frames
       ↓
Three.js
```

---

# 66. Bond Animation

Broken bond:

```text
opacity:
1 → 0
```

Formed bond:

```text
opacity:
0 → 1
```

Bond order changes should animate thickness/representation where practical.

---

# 67. Molecular Geometry

Geometry generation should be its own service.

```ts
interface GeometryEngine {
    generateInitialGeometry(
        molecule: Molecule
    ): Coordinate[];

    optimizeGeometry?(
        molecule: Molecule
    ): Promise<Coordinate[]>;
}
```

---

# 68. Geometry Units

The chemical domain should use explicit units.

Primary molecular distance:

```text
Ångström
```

Internal rendering conversion:

```text
Ångström → Scene Units
```

Example:

```text
1 Å = 1 scene unit
```

or another documented scale.

The conversion must be centralized.

---

# 69. Units Architecture

Never scatter conversions throughout the application.

Use:

```text
lib/units.ts
```

Example:

```ts
angstromToScene()
sceneToAngstrom()
```

---

# 70. Measurement Architecture

Measurement service:

```text
Atom A
Atom B
 ↓
DistanceEngine
 ↓
Distance
```

Angle:

```text
Atom A
Atom B
Atom C
 ↓
AngleEngine
 ↓
Angle
```

---

# 71. Molecular Analysis Architecture

```text
Molecule
   ↓
AnalysisService
   ↓
ChemistryEngine
   ↓
MolecularAnalysis
```

Result may contain:

```text
Formula
Mass
Atom Count
Bond Count
Ring Count
HBD
HBA
Descriptors
```

---

# 72. Validation Architecture

Validation must be layered.

```text
Schema Validation
      ↓
Graph Validation
      ↓
Chemical Validation
      ↓
Optional Engine Validation
```

---

# 73. Validation Levels

## Level 1 — Data

Check:

* IDs
* References
* Types

## Level 2 — Graph

Check:

* Broken bonds
* Missing atoms
* Duplicate bonds

## Level 3 — Chemistry

Check:

* Valence
* Charge
* Bond order

## Level 4 — Advanced

External chemistry engine.

---

# 74. Validation Result

```ts
interface ValidationIssue {
    severity:
        | "ERROR"
        | "WARNING"
        | "INFO";

    code: string;

    message: string;

    atomIds?: string[];

    bondIds?: string[];
}
```

---

# 75. Rendering Performance

Target ordinary structures:

```text
1–100 atoms
```

should render at approximately:

```text
60 FPS
```

For larger structures:

```text
100–10,000 atoms
```

use:

* Instancing
* LOD
* Batched labels
* Reduced effects

---

# 76. Large Molecule Rendering

Architecture:

```text
Molecule
   ↓
Render Planner
   ↓
Small Structure
   → Standard Meshes

Large Structure
   → Instanced Rendering

Huge Structure
   → LOD / simplified rendering
```

---

# 77. Memory Management

Avoid:

```text
new Geometry()
new Material()
```

for every atom.

Prefer:

```text
Shared Geometry
Shared Materials
Instanced Meshes
```

Dispose resources when molecules are removed.

---

# 78. React Performance

Do not put the entire molecular graph into a React component's local state.

Use:

```text
Zustand
```

with selective subscriptions.

Bad:

```text
Molecule changed
 ↓
Entire workspace rerenders
```

Good:

```text
Atom changed
 ↓
Affected render object updates
```

---

# 79. Server vs Client

3D workspace:

```text
Client Component
```

Chemistry calculations:

```text
Server / Worker
```

Database:

```text
Server
```

Authentication:

```text
Server
```

Static element data:

```text
Client + Server
```

---

# 80. Next.js Architecture

Next.js should provide:

```text
Routing
API
Server Components
Client Components
Authentication integration
Database integration
```

The 3D molecular canvas must be dynamically loaded as a client-side module.

---

# 81. Server Components

Use Server Components for:

* Project lists
* Static information
* Server-rendered pages
* Metadata

Avoid using Server Components for:

* Three.js canvas
* Interactive molecule manipulation
* Camera state

---

# 82. Client Components

Use Client Components for:

* Molecular canvas
* Periodic table interactions
* Inspector
* Toolbars
* Reaction timeline
* Drag/drop
* Selection

---

# 83. File Processing

Small files:

```text
Browser
 ↓
Parser
```

Large/complex files:

```text
Browser
 ↓
Upload
 ↓
Server/Worker
 ↓
Parser
```

---

# 84. Security Boundary

External files are untrusted.

Pipeline:

```text
Upload
 ↓
File Validation
 ↓
Format Detection
 ↓
Safe Parser
 ↓
Schema Validation
 ↓
Chemical Validation
```

Never execute uploaded content.

---

# 85. Error Architecture

Errors should use structured codes.

Example:

```ts
type ErrorCode =
    | "INVALID_ATOM"
    | "INVALID_BOND"
    | "INVALID_MOLECULE"
    | "UNSUPPORTED_FORMAT"
    | "CHEMISTRY_ENGINE_ERROR"
    | "COMPUTATION_FAILED";
```

---

# 86. Logging

Use structured logging.

Events:

```text
MoleculeCreated
MoleculeImported
MoleculeExported
ReactionCreated
ReactionComputed
AnalysisCompleted
ValidationFailed
```

Avoid logging sensitive user data unnecessarily.

---

# 87. Observability

Track:

```text
API latency
Computation time
Rendering errors
Worker failures
Import failures
Export failures
Memory problems
```

---

# 88. Testing Architecture

Testing layers:

```text
Unit
 ↓
Integration
 ↓
Component
 ↓
E2E
 ↓
Performance
```

---

# 89. Unit Tests

Test:

```text
MolecularGraph
FormulaEngine
ValenceEngine
BondChangeEngine
ReactionDiffEngine
MeasurementEngine
Serialization
```

---

# 90. Integration Tests

Test:

```text
Create molecule
Add atoms
Create bonds
Validate molecule
Save molecule
Load molecule
Import molecule
Export molecule
```

---

# 91. E2E Tests

Example:

```text
Open application
 ↓
Select Carbon
 ↓
Add atom
 ↓
Select Hydrogen
 ↓
Add atom
 ↓
Create bond
 ↓
Inspect molecule
 ↓
Save project
```

---

# 92. Renderer Tests

Verify:

```text
Atom visibility
Bond visibility
Selection
Camera
Transform
Reaction animation
```

---

# 93. Security Testing

Test:

* Malformed molecular files
* Oversized uploads
* Invalid JSON
* Invalid API payloads
* Unauthorized project access
* Job abuse
* Injection attempts

---

# 94. Deployment Architecture

Initial deployment:

```text
                    Internet
                       │
                       ▼
                 ┌───────────┐
                 │ Next.js   │
                 │ Application│
                 └─────┬─────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
     PostgreSQL     Storage       Workers
```

---

# 95. Future Compute Architecture

For expensive chemistry:

```text
                     API
                      │
                      ▼
                 Job Queue
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
        Worker A   Worker B   Worker C
           │          │          │
       RDKit       OpenBabel   Quantum
```

---

# 96. GPU Architecture

GPU acceleration should only be introduced where profiling demonstrates a need.

Potential targets:

```text
3D rendering
Large molecular visualization
Geometry computation
Molecular dynamics
ML inference
```

Do not add GPU complexity prematurely.

---

# 97. WebGPU

WebGPU can eventually replace or supplement WebGL for:

* Massive molecular structures
* GPU compute
* Advanced rendering
* Particle-based visualization

The application should keep WebGL as the initial compatibility baseline.

---

# 98. WASM Architecture

WASM engines should use adapters.

```text
ChemistryEngine
      ↓
WASM Adapter
      ↓
WASM Module
```

Never expose WASM implementation details throughout the application.

---

# 99. Plugin Architecture

Future chemistry engines should be pluggable.

Example:

```ts
interface ChemistryPlugin {
    id: string;

    name: string;

    capabilities: ChemistryCapability[];

    engine: ChemistryEngine;
}
```

Capabilities:

```text
VALIDATION
SMILES
DESCRIPTORS
GEOMETRY
REACTION
OPTIMIZATION
QUANTUM
```

---

# 100. Feature Flags

Advanced features should be feature-flagged.

Examples:

```text
ENABLE_SMILES
ENABLE_REACTION_PREDICTION
ENABLE_RDKIT
ENABLE_OPENBABEL
ENABLE_QUANTUM
ENABLE_AI
ENABLE_WEBGPU
```

---

# 101. AI Architecture

AI should be an optional application service.

```text
User Prompt
     ↓
AI Service
     ↓
Structured Command
     ↓
Schema Validation
     ↓
Chemical Validation
     ↓
User Confirmation
     ↓
Molecular State
```

AI must not directly manipulate Three.js.

---

# 102. AI Command Format

Example:

```json
{
    "action": "ADD_ATOM",
    "element": 8
}
```

Another:

```json
{
    "action": "CREATE_BOND",
    "atomA": "atom_01",
    "atomB": "atom_02",
    "order": 1
}
```

The command must be validated before execution.

---

# 103. AI Safety Boundary

AI-generated chemistry should be classified as:

```text
USER_DEFINED
PREDICTED
HYPOTHETICAL
VALIDATED
EXPERIMENTALLY_VERIFIED
```

Never automatically label AI output as experimentally verified.

---

# 104. Caching

Cache:

```text
Element data
Molecule analysis
Repeated descriptors
Static datasets
```

Avoid caching mutable molecular state without versioning.

---

# 105. Database Caching

Potential:

```text
Redis
```

Use only after profiling demonstrates a requirement.

---

# 106. Autosave Architecture

```text
Workspace
 ↓
Debounced State Snapshot
 ↓
IndexedDB
```

Cloud autosave:

```text
Workspace
 ↓
Debounce
 ↓
API
 ↓
PostgreSQL
```

---

# 107. Local-First Architecture

The molecule builder should work locally.

```text
UI
 ↓
Zustand
 ↓
IndexedDB
```

Cloud synchronization can be added later.

---

# 108. Synchronization

Future collaborative architecture:

```text
Client A
   │
   ▼
Collaboration Server
   │
   ▼
Shared Document
   ▲
   │
Client B
```

A CRDT system may be introduced later.

Do not introduce collaborative synchronization into MVP.

---

# 109. Project Versioning

Every project must contain:

```text
schemaVersion
```

Example:

```json
{
    "schemaVersion": 1
}
```

Migration system:

```text
v1
 ↓
Migration
 ↓
v2
```

---

# 110. Environment Configuration

Environment variables should include:

```text
DATABASE_URL
NEXTAUTH_SECRET
REDIS_URL
CHEMISTRY_ENGINE_URL
AI_API_KEY
STORAGE_URL
```

Secrets must never be exposed to the client.

---

# 111. CI/CD

Pipeline:

```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
 ↓
E2E
 ↓
Deploy
```

---

# 112. Code Quality

Required:

```text
TypeScript strict mode
ESLint
Prettier
Automated tests
Schema validation
No implicit any
```

---

# 113. Dependency Rules

Domain layer must NOT depend on:

```text
React
Next.js
Three.js
Prisma
Browser APIs
```

Application layer should depend on:

```text
Domain
Interfaces
```

Infrastructure implements interfaces.

---

# 114. Dependency Direction

Correct:

```text
UI
 ↓
Application
 ↓
Domain
 ↑
Infrastructure
```

Infrastructure should implement domain/application interfaces.

---

# 115. Circular Dependency Prevention

Avoid:

```text
Molecule → Renderer → Molecule
```

Instead:

```text
Molecule
   ↓
Renderer Adapter
   ↓
Renderer
```

---

# 116. Scientific Data Versioning

Scientific datasets must include:

```text
source
version
retrievedAt
```

Example:

```json
{
    "source": "scientific_dataset",
    "version": "2026.x",
    "retrievedAt": "..."
}
```

---

# 117. Scientific Accuracy

The system must distinguish:

```text
Visual approximation
Computed property
Database value
Prediction
Experimental result
```

These must not be mixed.

---

# 118. Molecular Units

All physical values must have explicit units.

Examples:

```text
Distance → Å
Mass → g/mol
Temperature → K
Pressure → Pa
Angle → degrees
Energy → eV / kJ/mol
```

Do not pass unitless physical quantities through the system.

---

# 119. Internationalization

Architecture should allow future localization.

Text should not be hard-coded throughout components.

Use:

```text
i18n
```

later if required.

---

# 120. Accessibility Architecture

UI components must provide:

```text
ARIA labels
Keyboard navigation
Focus management
Reduced motion
Accessible error messages
```

3D objects should expose alternative textual information through the inspector.

---

# 121. Mobile Architecture

Desktop is primary.

Mobile should use:

```text
Simplified 3D viewer
Bottom sheets
Collapsed panels
Touch gestures
```

Do not attempt to reproduce the entire desktop workspace on a phone.

---

# 122. Recommended Implementation Sequence

## Stage 1

```text
Next.js
TypeScript
Tailwind
shadcn
Three.js
R3F
Zustand
```

Build:

```text
Application Shell
3D Canvas
Camera
```

---

## Stage 2

Build:

```text
Element Dataset
Periodic Table
Atom Renderer
Atom Selection
Atom Placement
```

---

## Stage 3

Build:

```text
Molecular Graph
Bond System
Molecule State
Inspector
```

---

## Stage 4

Build:

```text
Validation
Formula Engine
Measurements
Analysis
Undo/Redo
```

---

## Stage 5

Build:

```text
Project Serialization
IndexedDB
Import
Export
```

---

## Stage 6

Build:

```text
Reaction Editor
Reaction Graph
Atom Mapping
Bond Difference
Reaction Animation
```

---

## Stage 7

Integrate:

```text
RDKit
Open Babel
Advanced Chemistry Engines
```

---

## Stage 8

Add:

```text
AI
Reaction Prediction
Advanced Optimization
Quantum Chemistry
```

---

# 123. MVP Architecture

The first version should look like:

```text
                 Next.js
                    │
        ┌───────────┴───────────┐
        │                       │
      React                   API
        │                       │
        ▼                       ▼
     Zustand               Chemistry Core
        │                       │
        ▼                       │
    Molecular Graph ◄───────────┘
        │
        ▼
 React Three Fiber
        │
        ▼
    Three.js
```

No external chemistry engine is required for the initial molecule builder.

---

# 124. MVP Data Flow

Creating an atom:

```text
Periodic Table
      ↓
Select Element
      ↓
Add Atom Command
      ↓
Molecular Graph
      ↓
Zustand Store
      ↓
Renderer
      ↓
Three.js Sphere
```

---

# 125. MVP Bond Flow

```text
Select Atom A
      ↓
Select Atom B
      ↓
CreateBondCommand
      ↓
Molecular Graph
      ↓
Valence Validation
      ↓
Zustand
      ↓
Bond Renderer
```

---

# 126. MVP Reaction Flow

```text
Reactant A
     +
Reactant B
     ↓
Reaction Editor
     ↓
Reaction Model
     ↓
Reaction Diff
     ↓
Product
     ↓
Animation
```

At this stage reaction generation can be user-defined rather than AI-predicted.

---

# 127. Critical Architecture Rules

The development team must follow these rules:

### Rule 1

Never store Three.js objects as the source of truth.

### Rule 2

Never put chemistry algorithms inside React components.

### Rule 3

Never put database queries inside molecular domain classes.

### Rule 4

Never assume a visually plausible structure is chemically valid.

### Rule 5

Never label a predicted reaction as experimentally verified.

### Rule 6

Never block the UI thread with expensive computation.

### Rule 7

Never create independent Three.js geometry/material for every atom when instancing is practical.

### Rule 8

Never bypass validation for AI-generated structures.

### Rule 9

Every physical quantity must have an explicit unit.

### Rule 10

Every persisted project must have a schema version.

---

# 128. Final Architecture

The complete target architecture is:

```text
                         ATOMSYNTHESIZER
                               │
              ┌────────────────┴────────────────┐
              │                                 │
          Presentation                      API Layer
              │                                 │
       ┌──────┴──────┐                    ┌─────┴─────┐
       │             │                    │           │
       UI          3D View              REST       Jobs
       │             │                    │           │
       │         Three.js                │         Queue
       │             │                    │           │
       └──────┬──────┘                    └─────┬─────┘
              │                                 │
              ▼                                 ▼
        Application Layer                Compute Workers
              │                                 │
              ▼                         ┌───────┴────────┐
        Domain Layer                     │                │
              │                      Chemistry       Quantum
       ┌──────┼──────┐                 Engine          Engine
       │      │      │
    Atom    Bond   Molecule
       │      │      │
       └──────┼──────┘
              │
        Molecular Graph
              │
       ┌──────┴───────────┐
       │                  │
   Validation          Analysis
       │                  │
       └────────┬─────────┘
                │
         Infrastructure
                │
       ┌────────┼─────────┐
       │        │         │
   PostgreSQL Storage   External APIs
```

---

# 129. Final Architectural Objective

AtomSynthesizer must be built as a **molecular platform**, not merely as a Three.js visualization.

The correct dependency direction is:

```text
             UI
              ↓
        Application
              ↓
           Domain
              ↓
       Chemistry Interfaces
              ↓
       External Engines
```

while visualization remains a consumer:

```text
          Domain
             ↓
      Render Adapter
             ↓
       React Three Fiber
             ↓
          Three.js
```

This architecture allows the project to start as a lightweight browser-based molecular editor and eventually evolve into a significantly more capable platform supporting:

```text
Interactive Molecular Design
          +
Reaction Visualization
          +
Chemical Validation
          +
RDKit/Open Babel
          +
Molecular Optimization
          +
AI Assistance
          +
GPU/WASM Computation
          +
Quantum Chemistry
```

without requiring a rewrite of the core application.
