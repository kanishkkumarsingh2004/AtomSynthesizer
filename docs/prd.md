# AtomSynthesizer
## Product Requirements Document

**Project Name:** AtomSynthesizer  
**Document:** Product Requirements Document  
**Version:** 1.0.0  
**Status:** Initial Product Specification  
**Platform:** Web Application  
**Primary Interface:** Interactive 3D Molecular Workspace  
**Target Stack:** Next.js + TypeScript + React + Three.js  
**Package Manager:** pnpm

---

# 1. Product Overview

AtomSynthesizer is an interactive web-based molecular design and visualization platform that allows users to:

- Explore the periodic table
- Select chemical elements
- Add atoms to a 3D molecular workspace
- Position and manipulate atoms
- Create and modify chemical bonds
- Construct molecules interactively
- Visualize molecular geometry in 3D
- Define reactants and products
- Visualize reactions between molecules
- Analyze molecular properties
- Validate molecular structures
- Explore possible reaction transformations
- Compare reactants and products
- Visualize reaction mechanisms where supported
- Import and export molecular structures
- Save molecular designs
- Inspect atoms, bonds, charges, and molecular properties

The central experience is a large interactive 3D molecular workspace surrounded by scientific tools.

The application should feel like a combination of:

- Molecular modeling software
- Periodic table explorer
- Chemical reaction editor
- 3D scientific visualization platform
- Molecular analysis laboratory
- Educational chemistry environment

---

# 2. Product Vision

The goal is to create a browser-based environment where a user can move from:

    Element
       ↓
    Atom
       ↓
    Molecular Structure
       ↓
    Reactants
       ↓
    Reaction
       ↓
    Products
       ↓
    Molecular Analysis

without switching between multiple applications.

The platform should make molecular structures visually understandable while maintaining chemically meaningful data underneath.

---

# 3. Core Product Principle

The application must maintain a strict separation between:

1. Visualization
2. Molecular modeling
3. Chemical validation
4. Reaction prediction
5. Experimental synthesis claims

A visually valid molecular structure does not automatically mean that:

- the molecule is stable,
- the molecule exists,
- the molecule can be synthesized,
- the reaction is chemically valid,
- the reaction is experimentally feasible.

The UI must communicate this distinction clearly.

---

# 4. Target Users

## 4.1 Students

Students can:

- Explore the periodic table
- Learn atomic properties
- Build molecules
- Understand molecular geometry
- Experiment with bonding
- Visualize reactions

---

## 4.2 Researchers

Researchers can:

- Construct molecular structures
- Inspect molecular properties
- Compare structures
- Visualize reaction transformations
- Import/export molecular formats
- Prepare structures for external computational chemistry tools

---

## 4.3 Developers

Developers can use the platform as:

- A molecular visualization engine
- A chemistry education framework
- A reaction visualization frontend
- A computational chemistry UI

---

## 4.4 Educators

Educators can:

- Demonstrate molecular geometry
- Demonstrate chemical reactions
- Create molecular examples
- Explain atomic bonding
- Build interactive chemistry lessons

---

# 5. Product Scope

The application consists of the following major systems:

1. 3D Molecular Workspace
2. Periodic Table
3. Atom System
4. Bond System
5. Molecule Builder
6. Molecular Property Analyzer
7. Reaction Workspace
8. Reaction Visualization Engine
9. Molecular Validation Engine
10. Molecular Library
11. Import/Export System
12. Camera and Visualization Controls
13. Simulation/Animation System
14. Search System
15. Project Management
16. Settings
17. Help/Education Layer

---

# 6. Main Application Layout

The default interface should follow a scientific workstation layout.

```text
┌──────────────────────────────────────────────────────────────────┐
│                         TOP TOOLBAR                              │
│ Project | File | Edit | View | Analyze | Reaction | Help       │
├───────────────┬────────────────────────────────┬─────────────────┤
│               │                                │                 │
│   ELEMENT     │                                │   INSPECTOR     │
│   PANEL       │                                │                 │
│               │                                │                 │
│ Periodic      │        3D MOLECULAR            │   Selected      │
│ Table         │          WORKSPACE             │   Atom / Bond   │
│               │                                │   Properties    │
│               │                                │                 │
│               │                                │                 │
├───────────────┴────────────────────────────────┴─────────────────┤
│                    BOTTOM WORKSPACE                              │
│ Molecules | Reactants | Products | Reaction Timeline | Console  │
└──────────────────────────────────────────────────────────────────┘
````

The 3D workspace must occupy the majority of the viewport.

---

# 7. Main 3D Molecular Workspace

The 3D molecular workspace is the primary component of the application.

## Requirements

The workspace must support:

* Orbit camera
* Pan
* Zoom
* Atom selection
* Multi-selection
* Dragging atoms
* Atom placement
* Atom deletion
* Bond creation
* Bond deletion
* Molecule selection
* Molecule movement
* Molecular rotation
* Molecular scaling for visualization
* Grid display
* Coordinate axes
* Lighting controls
* Background controls
* Rendering modes
* Measurement tools

---

# 8. 3D Technology

The primary rendering system should use:

* Three.js
* React Three Fiber
* Drei where useful

The architecture should allow future integration with:

* WebGPU
* GPU compute
* WASM chemistry libraries
* Molecular dynamics engines

---

# 9. Rendering Modes

The application should support multiple molecular rendering styles.

## 9.1 Ball and Stick

Atoms are spheres.

Bonds are cylinders.

This is the default visualization.

---

## 9.2 Space Filling

Atoms occupy their approximate van der Waals volume.

---

## 9.3 Wireframe

Atoms and bonds represented using lightweight geometry.

---

## 9.4 Stick

Atoms are smaller and bonds dominate the visualization.

---

## 9.5 Atom Labels

Display:

* Element symbol
* Atomic number
* Atom index
* Formal charge

---

## 9.6 Bond Labels

Optional display of:

* Bond order
* Bond length
* Bond type

---

# 10. Atom Representation

Each atom must contain structured data.

Example:

```ts
interface Atom {
    id: string;

    element: ElementSymbol;

    atomicNumber: number;

    position: {
        x: number;
        y: number;
        z: number;
    };

    charge: number;

    isotope?: number;

    aromatic?: boolean;

    hybridization?: Hybridization;

    moleculeId: string;
}
```

The system must not rely only on the visual representation.

The underlying chemical graph is the source of truth.

---

# 11. Periodic Table

The application must provide a complete interactive periodic table.

The table should contain all currently recognized elements.

Each element should expose:

* Atomic number
* Symbol
* Name
* Atomic mass
* Electron configuration
* Electronegativity
* Atomic radius
* Covalent radius
* Van der Waals radius
* Common oxidation states
* Typical valence
* Melting point
* Boiling point
* Density
* Group
* Period
* Block
* Category

---

# 12. Periodic Table UI

The periodic table should be displayed as an interactive grid.

Example:

```text
 H                                                   He
 Li Be                              B  C  N  O  F  Ne
 Na Mg                              Al Si P  S  Cl Ar
 K  Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr
 ...
```

Elements should be selectable.

Selecting an element should:

1. Highlight it
2. Open element information
3. Enable "Add Atom"
4. Display relevant chemical properties

---

# 13. Element Search

Users should be able to search by:

* Element name
* Symbol
* Atomic number

Examples:

```text
oxygen
O
8
```

---

# 14. Add Atom Workflow

When the user selects an element:

```text
Select Element
      ↓
Click "Add Atom"
      ↓
Atom appears in 3D workspace
      ↓
Atom becomes selected
      ↓
Inspector opens
```

The atom should appear at:

* Cursor location if possible
* Workspace origin
* Or a sensible placement location

The system should avoid creating overlapping atoms automatically.

---

# 15. Atom Manipulation

Selected atoms should support:

* Translate
* Rotate molecule
* Delete
* Duplicate
* Change charge
* Change isotope
* Change position

Transformation controls should use a familiar 3D gizmo.

---

# 16. Bond System

The platform must support:

* Single bonds
* Double bonds
* Triple bonds
* Aromatic bonds
* Coordinate bonds where supported
* Hydrogen bonds as non-covalent visualization

Example:

```text
C — C
C = C
C ≡ C
```

---

# 17. Bond Creation

Possible interaction:

```text
Select Atom A
      ↓
Select "Create Bond"
      ↓
Select Atom B
      ↓
Bond created
      ↓
Validate bond
```

The system should provide visual feedback if a bond is chemically unusual.

---

# 18. Bond Validation

The system should analyze:

* Typical valence
* Bond order
* Formal charge
* Element compatibility
* Coordination environment

Example warning:

```text
⚠ Unusual Valence

Carbon currently has 6 bonding electrons.

Review the molecular structure.
```

Warnings should not necessarily prevent the user from modeling unusual structures.

---

# 19. Molecule Model

A molecule is represented as a graph.

```text
Molecule

Atoms
  ↓
Nodes

Bonds
  ↓
Edges
```

Example:

```ts
interface Molecule {
    id: string;

    name?: string;

    atoms: Atom[];

    bonds: Bond[];

    charge: number;

    multiplicity: number;

    metadata: MoleculeMetadata;
}
```

---

# 20. Molecular Graph

The internal representation should support:

```text
Atom → Bond → Atom
```

The graph should be independent of the renderer.

This allows:

* 3D rendering
* validation
* reaction processing
* serialization
* analysis
* search

without coupling chemistry logic to Three.js.

---

# 21. Molecular Properties

The application should calculate or retrieve:

* Molecular formula
* Molecular weight
* Atom count
* Bond count
* Formal charge
* Approximate composition
* Hydrogen bond donors
* Hydrogen bond acceptors
* Rotatable bonds
* Ring count
* Heavy atom count
* Aromatic atom count
* Topological properties where supported

---

# 22. Molecular Formula

The formula should automatically update.

Example:

```text
H2O
```

```text
C6H6
```

```text
C2H5OH
```

The formula generator should follow standard chemical ordering rules where possible.

---

# 23. Molecular Structure Validation

The validation engine should detect:

### Errors

* Impossible or unsupported atom references
* Invalid bond references
* Duplicate atom IDs
* Broken molecular graph
* Invalid data structures

### Chemical Warnings

* Unusual valence
* Unsupported charge state
* Unusual coordination
* Suspicious bond order
* Possible unstable structure

The UI must distinguish:

```text
ERROR
WARNING
INFORMATION
```

---

# 24. Reaction Workspace

The reaction workspace allows users to define:

```text
Reactant A + Reactant B
          ↓
       Reaction
          ↓
       Product
```

Example:

```text
[ Molecule A ] + [ Molecule B ]
             ↓
        Reaction Engine
             ↓
       [ Product ]
```

---

# 25. Reaction Editor

The reaction editor should provide:

* Reactant slots
* Reagent slots
* Catalyst slot
* Solvent information
* Temperature
* Pressure
* Reaction time
* Product slots
* Reaction arrow
* Reaction metadata

Example:

```text
Reactant A + Reactant B
        |
        | Catalyst
        | Solvent
        | Temperature
        ↓
      Product
```

---

# 26. Reaction Visualization

The system should visually show:

1. Reactants
2. Molecular approach
3. Bond changes
4. Intermediate state where available
5. Product formation

Example animation:

```text
Reactants
   ↓
Alignment
   ↓
Bond Breaking
   ↓
Bond Formation
   ↓
Product
```

---

# 27. Reaction Difference Engine

The system should compare reactants and products.

Detect:

* Broken bonds
* Formed bonds
* Changed bond orders
* Changed charges
* Atom movement
* Atom mapping

Example:

```text
Broken:

C1 — Br5

Formed:

C1 — O8
```

---

# 28. Atom Mapping

Reaction atoms should have stable identifiers.

Example:

```text
Reactant:

C1
O2
H3

Product:

C1
O2
H3
```

This allows the visualization system to animate atoms from reactants into products.

---

# 29. Reaction Animation

Atoms should move smoothly between molecular states.

Requirements:

* Interpolation
* Camera transitions
* Bond fade-in
* Bond fade-out
* Atom movement
* Intermediate visualization
* Timeline control

Controls:

```text
▶ Play
⏸ Pause
⏮ Previous
⏭ Next
━━━━━━━━━━
Timeline
```

---

# 30. Reaction Engine

The reaction engine should be modular.

Possible layers:

```text
Reaction Input
      ↓
Reaction Normalization
      ↓
Chemical Rules
      ↓
Reaction Transformation
      ↓
Product Generation
      ↓
Validation
      ↓
Visualization
```

---

# 31. Important Chemical Limitation

The application must not present generated reactions as experimentally verified chemistry unless backed by an appropriate validated source or model.

Reaction output should be classified as:

```text
Validated
Predicted
Hypothetical
User-defined
Unknown
```

Example:

```text
Prediction Confidence: Moderate

This transformation is computationally predicted
and should not be interpreted as an experimentally
validated synthesis procedure.
```

---

# 32. Reaction Library

The application should eventually support common reaction classes.

Examples:

* Substitution
* Addition
* Elimination
* Oxidation
* Reduction
* Hydrolysis
* Condensation
* Esterification
* Amide formation
* Coupling reactions
* Rearrangements

The architecture must allow new reaction types to be added without modifying the core application.

---

# 33. Molecular Comparison

Users should be able to compare two molecules.

Display:

```text
Molecule A              Molecule B

Formula                 Formula

Atoms                   Atoms

Molecular Weight        Molecular Weight

Bonds                   Bonds

3D Structure            3D Structure
```

Differences should be highlighted visually.

---

# 34. Selection System

Selection states:

```text
None
Atom
Bond
Molecule
Multiple Atoms
Multiple Molecules
```

Selected objects should have visual highlighting.

---

# 35. Inspector Panel

The inspector should dynamically show information based on selection.

## Atom Inspector

```text
Element
Atomic Number
Atomic Mass
Position
Charge
Isotope
Hybridization
Bond Count
```

## Bond Inspector

```text
Bond Type
Bond Order
Length
Connected Atoms
```

## Molecule Inspector

```text
Formula
Mass
Charge
Atom Count
Bond Count
Rings
Properties
```

---

# 36. Coordinate System

The 3D workspace should support:

* X axis
* Y axis
* Z axis
* Grid
* Origin marker
* Coordinate readout

Example:

```text
X: 1.42
Y: -0.37
Z: 2.11
```

---

# 37. Measurement Tools

Users should be able to measure:

## Distance

```text
Atom A → Atom B

Distance: 1.42 Å
```

## Angle

```text
A → B → C

Angle: 109.5°
```

## Dihedral Angle

```text
A → B → C → D

Dihedral: 180°
```

---

# 38. Molecular Geometry

The system should support visualization of:

* Linear
* Trigonal planar
* Tetrahedral
* Trigonal pyramidal
* Bent
* Trigonal bipyramidal
* Octahedral
* Other supported geometries

Geometry should be derived from molecular data when possible rather than simply guessed visually.

---

# 39. Camera Controls

Controls:

```text
Orbit
Pan
Zoom
Reset Camera
Focus Selection
Focus Molecule
Top View
Front View
Side View
Isometric View
```

Keyboard shortcuts should be supported.

---

# 40. Rendering Performance

The application must be optimized for large molecular structures.

Requirements:

* Instanced meshes where appropriate
* Reuse geometries
* Reuse materials
* Avoid unnecessary React re-renders
* Efficient atom selection
* Efficient bond rendering
* Lazy-load heavy systems
* Web Worker support for expensive calculations

---

# 41. Large Molecule Support

The architecture should target:

### Basic

1–100 atoms

### Advanced

100–10,000 atoms

### Experimental

10,000+ atoms

The system should degrade gracefully.

For large structures:

* Simplify rendering
* Reduce labels
* Disable expensive effects
* Use instancing
* Use level-of-detail rendering

---

# 42. Visualization Settings

Users should control:

* Atom size
* Bond thickness
* Bond length scaling
* Labels
* Grid
* Axes
* Shadows
* Ambient lighting
* Background
* Anti-aliasing
* Rendering mode

---

# 43. Element Colors

The application should use a standard scientific color convention where appropriate.

However, users should be able to customize colors.

Example:

```text
Carbon → configurable
Oxygen → configurable
Hydrogen → configurable
Nitrogen → configurable
```

The color system must be centralized.

---

# 44. Search

Global search should support:

* Elements
* Molecules
* Reactions
* Saved projects
* Chemical formulas

Example:

```text
Search: caffeine
```

Possible results:

```text
Molecule
Caffeine
Formula: C8H10N4O2
```

---

# 45. Molecule Library

Users should be able to save molecules.

Each entry:

```ts
interface MoleculeRecord {
    id: string;
    name: string;
    formula: string;
    structure: Molecule;
    createdAt: string;
    updatedAt: string;
}
```

---

# 46. Project System

A project can contain:

```text
Project
 ├── Molecules
 ├── Reactions
 ├── Notes
 ├── Measurements
 ├── Visualization Settings
 └── Metadata
```

---

# 47. Undo / Redo

The application must implement undo/redo.

Operations include:

* Add atom
* Delete atom
* Move atom
* Add bond
* Delete bond
* Change bond order
* Change charge
* Add molecule
* Delete molecule
* Reaction modifications

Use command/history architecture rather than manually tracking individual UI components.

---

# 48. Copy / Paste

Support:

* Copy atom
* Copy molecule
* Copy selection
* Paste molecule
* Duplicate molecule

---

# 49. Import System

The application should eventually support common molecular formats.

Priority:

1. JSON
2. XYZ
3. MOL
4. SDF
5. SMILES
6. MOL2
7. PDB

The parser system should be modular.

---

# 50. Export System

Support:

* JSON
* XYZ
* MOL
* SDF
* SMILES where valid
* Image
* SVG
* Screenshot

Future:

* GLTF
* GLB
* PDB

---

# 51. SMILES Support

SMILES should be treated as a chemical representation rather than a 3D representation.

Workflow:

```text
SMILES
 ↓
Parse
 ↓
Molecular Graph
 ↓
Generate/Import Coordinates
 ↓
3D Visualization
```

The application must clearly distinguish:

```text
2D/graph representation
```

from:

```text
3D coordinates
```

---

# 52. 3D Structure Generation

The platform may provide automatic initial geometry generation.

Example:

```text
Molecular Graph
      ↓
Geometry Generation
      ↓
Initial 3D Coordinates
      ↓
User Adjustment
```

This should be described as an initial geometry rather than a guaranteed optimized molecular conformation.

---

# 53. Future Molecular Optimization

The architecture should allow future integration with:

* Molecular mechanics
* Force fields
* Quantum chemistry
* Geometry optimization
* Energy calculations

Potential engines:

```text
RDKit
Open Babel
UFF
MMFF
xTB
PySCF
Psi4
```

These should not be hard-coded into the frontend.

---

# 54. Simulation Architecture

Long-running computations should not execute directly in the UI thread.

Architecture:

```text
Browser
   ↓
API
   ↓
Job Queue
   ↓
Compute Worker
   ↓
Chemistry Engine
   ↓
Result
   ↓
Database
   ↓
Browser
```

---

# 55. Reaction Computation

Reaction computation should eventually support external computational services.

Example:

```text
Frontend
   ↓
Next.js API
   ↓
Reaction Service
   ↓
Chemistry Engine
   ↓
Result
```

The system must support asynchronous jobs.

---

# 56. Job States

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED
```

The UI should display job progress.

---

# 57. Database

The system should persist:

* Users
* Projects
* Molecules
* Atoms
* Bonds
* Reactions
* Jobs
* Analysis results
* User settings

Possible database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

---

# 58. Data Architecture

The system should separate:

```text
UI State
     ↓
Molecular State
     ↓
Chemical Domain Model
     ↓
Persistence
```

Do not store Three.js objects directly in the database.

---

# 59. Recommended Frontend Architecture

```text
app/
├── page.tsx
├── workspace/
│   └── page.tsx
│
components/
├── molecular/
│   ├── MolecularCanvas.tsx
│   ├── Atom.tsx
│   ├── Bond.tsx
│   ├── Molecule.tsx
│   └── Selection.tsx
│
├── periodic-table/
│   ├── PeriodicTable.tsx
│   ├── ElementCard.tsx
│   └── ElementDetails.tsx
│
├── reaction/
│   ├── ReactionEditor.tsx
│   ├── ReactionTimeline.tsx
│   └── ReactionViewer.tsx
│
├── inspector/
│   ├── AtomInspector.tsx
│   ├── BondInspector.tsx
│   └── MoleculeInspector.tsx
│
├── toolbar/
│   ├── MainToolbar.tsx
│   └── ViewToolbar.tsx
│
lib/
├── chemistry/
├── molecular/
├── reactions/
├── geometry/
├── validation/
└── exporters/
```

---

# 60. State Management

The molecular workspace requires centralized state.

The state should include:

```ts
interface WorkspaceState {
    molecules: Molecule[];

    selectedAtoms: string[];

    selectedBonds: string[];

    selectedMolecules: string[];

    activeElement?: ElementSymbol;

    activeTool: WorkspaceTool;

    camera: CameraState;

    rendering: RenderingState;

    reaction?: ReactionState;
}
```

Possible state technologies:

* Zustand
* Redux Toolkit

Zustand is preferred for lightweight interactive state.

---

# 61. Workspace Tools

The toolbar should contain:

```text
Select
Move
Rotate
Add Atom
Create Bond
Measure
Delete
Duplicate
Reaction
```

---

# 62. Keyboard Shortcuts

Recommended:

```text
V → Select
M → Move
B → Bond
A → Add Atom
R → Rotate
D → Delete
Ctrl/Cmd + Z → Undo
Ctrl/Cmd + Shift + Z → Redo
Delete → Delete selection
F → Focus selection
Space → Play/Pause reaction
```

---

# 63. Context Menu

Right-clicking an atom should show:

```text
Inspect
Move
Duplicate
Change Element
Change Charge
Change Isotope
Create Bond
Delete
```

---

# 64. Molecular Analysis Panel

The analysis panel should provide sections:

```text
Structure
Composition
Geometry
Bonding
Charge
Physical Properties
Descriptors
Validation
```

---

# 65. Reaction Analysis Panel

Show:

```text
Reactants
Products
Atoms Changed
Bonds Broken
Bonds Formed
Bond Order Changes
Charge Changes
Reaction Class
Prediction Status
Warnings
```

---

# 66. Reaction Timeline

Timeline:

```text
0%      25%      50%      75%      100%

Reactant → Transition → Intermediate → Product
```

Users can scrub through the animation.

---

# 67. Multiple Molecules

The workspace must support multiple independent molecules.

Example:

```text
Molecule A

     +

Molecule B

     +

Catalyst

     ↓

Molecule C
```

Each molecule should have its own ID.

---

# 68. Molecule Grouping

Users should be able to group molecules.

Example:

```text
Reaction Mixture
 ├── Reactant A
 ├── Reactant B
 ├── Catalyst
 └── Solvent
```

---

# 69. Chemical Formula Parser

The platform should parse formulas such as:

```text
H2O
CO2
CH4
C6H6
C8H10N4O2
```

It should detect:

* Elements
* Counts
* Invalid symbols
* Invalid syntax

---

# 70. Safety Architecture

The platform must clearly separate educational/modeling functionality from experimental instructions.

The application should not imply:

```text
"Generate molecule → manufacture it"
```

Instead:

```text
Design
 ↓
Model
 ↓
Analyze
 ↓
Predict
 ↓
Validate
 ↓
External scientific verification
```

Experimental procedures should require appropriate scientific validation and external authoritative sources.

---

# 71. Scientific Confidence

Every computed result should have a status where applicable.

Example:

```text
● COMPUTED
● PREDICTED
● USER DEFINED
● EXPERIMENTALLY VERIFIED
● UNKNOWN
```

The system must never label a hypothetical result as experimentally verified.

---

# 72. Accessibility

The application should support:

* Keyboard navigation
* Screen-reader labels for controls
* High contrast mode
* Reduced motion
* Accessible tooltips
* Clear error messages

The 3D canvas should have alternative textual information where meaningful.

---

# 73. Responsive Design

Desktop is the primary target.

Minimum supported experience:

```text
Desktop
Laptop
Large Tablet
```

Mobile should provide a simplified viewer rather than attempting to reproduce the entire scientific workstation.

---

# 74. Performance Requirements

Target:

```text
Initial UI load: < 2 seconds where practical
Interactive frame rate: ~60 FPS for ordinary molecules
Atom selection: < 50 ms perceived response
UI interactions: < 100 ms perceived response
```

Large molecule rendering should degrade gracefully.

---

# 75. Web Workers

Use Web Workers for:

* Molecular calculations
* Formula parsing
* Validation of large structures
* Geometry processing
* Heavy graph operations

Do not block the main rendering thread.

---

# 76. WebAssembly

The architecture should allow WASM modules for computational chemistry.

Potential future components:

```text
RDKit WASM
Open Babel WASM
Custom geometry engine
Custom molecular graph engine
```

WASM modules should be isolated behind interfaces.

---

# 77. API Architecture

Recommended API structure:

```text
/api
├── elements
├── molecules
├── molecules/[id]
├── reactions
├── reactions/[id]
├── analysis
├── validation
├── projects
├── jobs
└── export
```

---

# 78. API Principles

API endpoints should:

* Validate input
* Return typed responses
* Never trust client molecular data
* Use schema validation
* Return structured errors
* Support asynchronous jobs

Recommended validation:

```text
Zod
```

---

# 79. Authentication

Future support:

* Email authentication
* OAuth
* GitHub
* Google

Authentication is not required for the initial prototype.

Anonymous/local mode should be supported.

---

# 80. Local Mode

Users should be able to construct molecules without creating an account.

Local persistence can use:

```text
IndexedDB
```

This allows:

* Offline projects
* Fast autosave
* Temporary experiments

---

# 81. Autosave

The application should automatically save workspace state.

Example:

```text
Saving...
Saved
```

Autosave should not interrupt interaction.

---

# 82. Project File Format

The native project format should contain:

```json
{
    "version": "1.0",
    "project": {},
    "molecules": [],
    "reactions": [],
    "settings": {}
}
```

Versioning is mandatory.

---

# 83. Version Migration

Future project formats must be migratable.

Example:

```text
v1
 ↓
Migration
 ↓
v2
```

Never silently break old project files.

---

# 84. Error Handling

Errors should be classified.

### User Errors

```text
Invalid atom
Invalid bond
Unsupported structure
```

### System Errors

```text
Rendering failure
Computation failure
Network failure
```

### Scientific Warnings

```text
Unusual valence
Potentially unstable structure
Prediction uncertainty
```

---

# 85. Visual Design

The application should have a professional scientific interface.

Recommended style:

* Dark workspace
* High contrast molecular objects
* Minimal distractions
* Compact scientific panels
* Clear icons
* Dense but readable information

The 3D workspace should visually dominate.

---

# 86. UI Layout

Suggested:

```text
┌─────────────────────────────────────────────────────────┐
│ Logo | Project | File | Edit | View | Analyze | Help   │
├─────────────┬────────────────────────────┬──────────────┤
│             │                            │              │
│ PERIODIC    │                            │  INSPECTOR   │
│ TABLE       │                            │              │
│             │        MOLECULAR           │              │
│ H H He      │          3D VIEW           │ Atom         │
│ Li ...      │                            │ Properties   │
│             │                            │              │
│ Search      │                            │              │
│             │                            │              │
├─────────────┴────────────────────────────┴──────────────┤
│ Reactants | Products | Reaction Timeline | Analysis     │
└─────────────────────────────────────────────────────────┘
```

---

# 87. Design System

Recommended UI technologies:

* Tailwind CSS
* shadcn/ui
* Radix primitives
* Lucide icons

The 3D scene must remain visually independent from the UI system.

---

# 88. Loading States

For expensive operations:

```text
Preparing molecule...
Generating geometry...
Validating structure...
Calculating properties...
Running reaction prediction...
```

Do not freeze the interface.

---

# 89. Empty State

When no molecule exists:

```text
Build Your First Molecule

Choose an element from the periodic table
and add an atom to the workspace.

[ Open Periodic Table ]
```

---

# 90. First-Time Experience

Initial workflow:

```text
Welcome
   ↓
Choose Element
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
```

A small guided tutorial should teach the workspace.

---

# 91. Example Workflow

## Create Water

User:

1. Selects Oxygen
2. Adds O atom
3. Selects Hydrogen
4. Adds H atom
5. Adds second H atom
6. Creates O-H bonds
7. System calculates formula

Result:

```text
H2O

Molecular Weight:
18.015 g/mol

Atoms:
3

Bonds:
2
```

---

# 92. Example Reaction Workflow

```text
Create Reactant A
       +
Create Reactant B
       ↓
Add to Reaction Workspace
       ↓
Select Reaction Type
       ↓
Generate Product
       ↓
Validate
       ↓
Compare
       ↓
Visualize
```

---

# 93. Reaction Visualization Example

```text
        Reactant A

             +

        Reactant B

             ↓

       Bond changes

             ↓

        Intermediate

             ↓

          Product
```

The animation should preserve atom identities.

---

# 94. Scientific Data Sources

Element information should originate from reliable scientific datasets.

Do not manually type hundreds of element properties into random UI files.

Use a centralized structured dataset.

Example:

```text
data/elements.json
```

The dataset should have a documented source and version.

---

# 95. Data Validation

Element data should be schema validated during development.

Example:

```ts
ElementSchema.parse(element);
```

Invalid data should fail during development/build rather than silently reaching users.

---

# 96. Testing Strategy

Testing must include:

## Unit Tests

* Formula parser
* Molecular graph
* Bond validation
* Atom validation
* Reaction diff
* Serialization
* Deserialization

## Integration Tests

* Add atom
* Create bond
* Save molecule
* Load molecule
* Import structure
* Export structure

## E2E Tests

* Build molecule
* Edit molecule
* Create reaction
* Run reaction visualization
* Save project

---

# 97. 3D Testing

The renderer should be tested for:

* Atom rendering
* Bond rendering
* Selection
* Camera movement
* Molecule focus
* Large structure performance

Visual regression tests should be considered for important scenes.

---

# 98. Security

The application must:

* Validate uploaded files
* Limit file sizes
* Sanitize imported metadata
* Validate API payloads
* Prevent arbitrary code execution through molecular files
* Rate-limit expensive server jobs

---

# 99. File Upload Security

Imported molecular files must never be blindly executed.

Parsing must happen through safe parsers.

Uploaded content should be treated as untrusted input.

---

# 100. Architecture Principles

The application should follow:

```text
Presentation
     ↓
Application Logic
     ↓
Domain Logic
     ↓
Infrastructure
```

The molecular domain model must not depend on React.

The chemistry engine must not depend on Three.js.

The renderer must consume molecular data.

---

# 101. Domain Layer

Core entities:

```text
Element
Atom
Bond
Molecule
Reaction
Project
Measurement
Analysis
```

---

# 102. Application Layer

Services:

```text
MoleculeBuilder
MoleculeValidator
ReactionEngine
ReactionDiffEngine
GeometryService
FormulaService
ImportService
ExportService
AnalysisService
```

---

# 103. Infrastructure Layer

Adapters:

```text
Database
File Storage
Chemistry Libraries
WASM Engines
External APIs
Job Queue
```

---

# 104. Renderer Layer

The renderer should consume:

```ts
Molecule
```

and produce:

```text
3D Scene
```

Never make Three.js objects the source of truth.

---

# 105. Reaction Domain Model

Example:

```ts
interface Reaction {
    id: string;

    reactants: Molecule[];

    reagents?: Molecule[];

    catalysts?: Molecule[];

    products: Molecule[];

    conditions?: ReactionConditions;

    status: ReactionStatus;

    atomMapping?: AtomMapping[];

    bondChanges?: BondChange[];
}
```

---

# 106. Reaction Conditions

Represent conditions structurally:

```ts
interface ReactionConditions {
    temperature?: number;
    pressure?: number;
    solvent?: string;
    duration?: number;
    atmosphere?: string;
}
```

Conditions should be metadata unless an actual validated computational model uses them.

---

# 107. Reaction Status

```ts
type ReactionStatus =
    | "USER_DEFINED"
    | "PREDICTED"
    | "VALIDATED"
    | "EXPERIMENTALLY_VERIFIED"
    | "UNKNOWN";
```

---

# 108. Chemistry Engine Abstraction

Use interfaces.

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

    predictReaction?(
        reaction: ReactionInput
    ): Promise<ReactionPrediction>;
}
```

This prevents vendor lock-in.

---

# 109. External Chemistry Engines

External engines should be accessed through adapters.

Example:

```text
ChemistryEngine
      │
      ├── LocalEngine
      ├── RDKitAdapter
      ├── OpenBabelAdapter
      └── QuantumEngineAdapter
```

---

# 110. AI Integration

AI may eventually assist with:

* Molecule search
* Reaction classification
* Natural-language molecule queries
* Structure explanation
* Property explanation
* Reaction interpretation
* Candidate generation

Example:

```text
"Create a molecule containing
two carbon atoms and one oxygen."
```

AI converts this into structured actions.

The AI must not directly mutate the molecular state without validation.

---

# 111. Natural Language Interface

Future interface:

```text
User:
"Show me a molecule with six carbons
arranged as a ring."

AI
 ↓
Molecular Graph
 ↓
Validation
 ↓
3D Structure
```

AI-generated structures must pass the same validation pipeline as manually created structures.

---

# 112. AI Safety Boundary

AI output should never bypass:

```text
Schema Validation
        ↓
Chemical Validation
        ↓
User Confirmation
```

for destructive or scientifically consequential operations.

---

# 113. Undo Architecture

Use command-based operations.

Example:

```text
AddAtomCommand
DeleteAtomCommand
MoveAtomCommand
CreateBondCommand
DeleteBondCommand
ChangeBondOrderCommand
```

Each command must implement:

```ts
execute()
undo()
```

---

# 114. Performance Architecture

Avoid:

```text
React state
     ↓
Entire 3D scene rerender
```

Prefer:

```text
Molecular Store
     ↓
Selective subscription
     ↓
Affected objects only
```

---

# 115. Rendering Optimization

Use:

* InstancedMesh
* Shared geometries
* Shared materials
* Frustum culling
* Level of detail
* Lazy labels
* Batched updates

Avoid creating a new Three.js geometry/material for every atom.

---

# 116. Large Dataset Strategy

Periodic table data should be loaded immediately.

Heavy chemistry engines should be lazy-loaded.

Large molecular structures should be streamed or processed incrementally where practical.

---

# 117. Browser Compatibility

Primary:

* Chromium
* Firefox
* Safari

WebGL2 should be required for the initial application.

WebGPU should be considered an enhancement rather than a hard requirement.

---

# 118. Offline Capability

The core molecule builder should work without network access after initial application loading.

Offline features:

* Add atoms
* Create bonds
* Edit molecules
* Inspect basic properties
* Save locally
* Export files

Online-only features may include:

* Cloud storage
* AI
* Remote computation
* Reaction prediction services

---

# 119. Analytics

Optional anonymous analytics may track:

* Feature usage
* Rendering errors
* Performance
* Import failures

Do not collect molecular designs without explicit user consent.

---

# 120. Privacy

User-created molecular structures should be treated as user data.

If cloud storage is implemented:

* Encrypt data in transit
* Secure database access
* Provide deletion
* Provide export
* Clearly explain data retention

---

# 121. MVP

The first release should NOT attempt to implement every feature.

MVP should contain:

### Core

* Next.js
* TypeScript
* Three.js / React Three Fiber
* Dark scientific UI
* 3D workspace
* Periodic table
* Add atom
* Delete atom
* Move atom
* Create bonds
* Delete bonds
* Bond order
* Atom inspector
* Molecule inspector
* Formula generation
* Basic molecular validation
* Undo/redo
* Save/load local project
* JSON import/export
* Screenshot export

---

# 122. MVP 3D Experience

The MVP must make this workflow excellent:

```text
Periodic Table
      ↓
Select Element
      ↓
Add Atom
      ↓
Position Atom
      ↓
Select Second Atom
      ↓
Create Bond
      ↓
Inspect Molecule
```

Do not dilute the MVP with premature AI or complex quantum simulation.

---

# 123. Phase 2

Add:

* SMILES
* MOL
* SDF
* XYZ
* Molecular comparison
* Measurement tools
* Advanced geometry
* Reaction editor
* Reaction diff
* Reaction animation
* Molecule library

---

# 124. Phase 3

Add:

* Reaction prediction
* AI assistant
* RDKit/Open Babel integration
* Molecular optimization
* Advanced analysis
* Cloud projects
* Collaboration

---

# 125. Phase 4

Add:

* Computational chemistry
* Molecular mechanics
* Quantum chemistry integrations
* Advanced reaction mechanisms
* Job queues
* GPU/WASM acceleration
* Research workflows

---

# 126. Non-Goals for MVP

Do NOT initially build:

* Full quantum chemistry engine
* Molecular dynamics engine
* Universal reaction predictor
* Experimental synthesis planner
* Autonomous chemistry laboratory
* Full scientific database
* Protein docking platform

These are separate major products.

---

# 127. Definition of Done — Molecule Builder

The molecule builder is complete when:

* User can select any supported element
* User can add it to the scene
* User can move atoms
* User can delete atoms
* User can create bonds
* User can change bond order
* User can inspect atoms
* User can inspect molecules
* Formula updates automatically
* Basic valence warnings work
* Undo/redo works
* Project can be saved
* Project can be loaded

---

# 128. Definition of Done — Reaction System

Reaction system is complete when:

* Multiple reactants can be defined
* Products can be defined
* Atoms can be mapped
* Bond changes are detected
* Broken bonds are visualized
* New bonds are visualized
* Reaction animation works
* Timeline works
* Reaction status is visible
* Hypothetical/predicted reactions are clearly labeled

---

# 129. Definition of Done — 3D Engine

The 3D engine is complete when:

* Camera controls work
* Atom rendering works
* Bond rendering works
* Selection works
* Gizmos work
* Molecule focus works
* Rendering modes work
* Large structures remain usable
* No major memory leaks occur

---

# 130. Project Success Metrics

## Technical

* Stable 60 FPS for normal molecular structures
* Low interaction latency
* No major rendering crashes
* Reliable project serialization

## Product

* Time to create first molecule
* Number of molecules created
* Number of projects saved
* Reaction visualizations completed
* Import/export success rate

## Educational

* Users can understand molecular composition
* Users can visually identify bond changes
* Users can inspect molecular properties

---

# 131. Future Roadmap

Long-term platform:

```text
                AtomSynthesizer
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   Molecules        Reactions        Analysis
       │               │                │
       └───────────────┼────────────────┘
                       │
                Chemistry Engine
                       │
       ┌───────────────┼────────────────┐
       │               │                │
      RDKit         Open Babel       Quantum
       │               │                │
       └───────────────┼────────────────┘
                       │
                 Compute Layer
                       │
               CPU / GPU / WASM
```

---

# 132. Final Product Concept

The final application should feel like a digital molecular laboratory.

The primary interaction should always remain:

```text
ELEMENT
   ↓
ATOM
   ↓
MOLECULE
   ↓
REACTION
   ↓
PRODUCT
   ↓
ANALYSIS
```

The 3D molecular environment is the center of the application.

The periodic table is the primary source for creating atoms.

The molecular graph is the source of truth.

The chemistry engine validates and analyzes structures.

The reaction engine handles transformations.

The renderer visualizes molecular states.

The AI layer, if added, assists the user but never bypasses the scientific/domain validation layer.

---

# 133. Recommended Initial Technology Stack

## Frontend

```text
Next.js
React
TypeScript
pnpm
Tailwind CSS
shadcn/ui
Lucide
```

## 3D

```text
Three.js
React Three Fiber
Drei
```

## State

```text
Zustand
```

## Validation

```text
Zod
```

## Backend

```text
Next.js API
```

## Database

```text
PostgreSQL
Prisma
```

## Local Storage

```text
IndexedDB
```

## Heavy Computation

```text
Web Workers
WebAssembly
```

## Future Chemistry

```text
RDKit
Open Babel
Molecular Mechanics
Quantum Chemistry Engines
```

---

# 134. Development Priority

Implementation order:

```text
1. Application shell
2. 3D renderer
3. Camera controls
4. Atom rendering
5. Periodic table
6. Atom placement
7. Selection
8. Atom manipulation
9. Bond system
10. Molecular graph
11. Validation
12. Formula generation
13. Inspector
14. Undo/redo
15. Project serialization
16. Import/export
17. Reaction workspace
18. Reaction diff
19. Reaction animation
20. Advanced chemistry
21. AI
22. Computational engines
```

The developer must not jump directly to AI/reaction prediction before the molecular graph, validation, serialization, and 3D engine are stable.

---

# 135. Core Engineering Rule

The most important architectural rule is:

```text
CHEMISTRY DATA ≠ 3D RENDERING DATA
```

The molecular structure must exist independently of Three.js.

Correct:

```text
Molecule
   ↓
Renderer
   ↓
Three.js
```

Incorrect:

```text
Three.js Object
   ↓
Chemical State
```

This separation is mandatory for the long-term scalability of AtomSynthesizer.

---

# 136. Final Vision

AtomSynthesizer should eventually provide one unified environment where a user can:

```text
Explore the Periodic Table
          ↓
Select Elements
          ↓
Construct Atoms
          ↓
Build Molecules
          ↓
Inspect Molecular Geometry
          ↓
Measure Structure
          ↓
Define Reactants
          ↓
Define Reaction
          ↓
Generate / Import Product
          ↓
Compare Structures
          ↓
Visualize Bond Changes
          ↓
Analyze Properties
          ↓
Export Molecular Data
```

The platform should prioritize **scientific correctness, modular architecture, high-performance 3D visualization, and clear separation between visualization and actual chemical prediction**.

```

### One important design decision

I would **not** start by making the reaction-prediction system the centerpiece. That's the technically weakest part of the idea because reliable reaction prediction requires substantial chemistry data/models and validation.

Build the platform in this order:

**Periodic Table → 3D Atom Engine → Molecular Graph → Bond/Valence Validation → Molecule Analysis → Reaction Editor → Reaction Visualization → Chemistry engines → AI/reaction prediction.**

That gives you a genuinely usable product early instead of a flashy 3D interface sitting on top of unreliable chemistry logic.
```
