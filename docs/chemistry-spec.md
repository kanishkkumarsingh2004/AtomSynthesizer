# AtomSynthesizer — Chemistry Specification

**File:** `chemistry-spec.md`
**Project:** AtomSynthesizer
**Version:** 1.0.0
**Status:** Engineering Specification
**Purpose:** Define the chemical data model, molecular graph rules, validation behavior, geometry representation, reaction representation, units, and scientific boundaries of AtomSynthesizer.

---

# 1. Purpose

AtomSynthesizer is a molecular modeling and visualization platform.

The chemistry layer is responsible for representing and analyzing:

* Elements
* Atoms
* Isotopes
* Formal charges
* Bonds
* Bond orders
* Molecular graphs
* 2D coordinates
* 3D coordinates
* Molecular formulas
* Molecular properties
* Molecular validation
* Reaction structures
* Reaction mappings
* Reaction changes
* Chemical metadata

The chemistry layer must remain independent from:

* React

* Next.js

* Three.js

* React Three Fiber

* DOM

* WebGL

* UI state

* Browser APIs

---

# 2. Scientific Scope

AtomSynthesizer is primarily a:

```text
Molecular Modeling
+
Visualization
+
Structure Analysis
+
Reaction Representation
```

platform.

It is not automatically a:

```text
Experimental Chemistry Laboratory
```

or:

```text
Universal Quantum Chemistry Simulator
```

The system must distinguish between:

```text
Representation
Prediction
Computation
Experiment
```

These are not interchangeable.

---

# 3. Chemical Data Hierarchy

The chemistry system follows:

```text
Periodic Table
      ↓
Element
      ↓
Atom
      ↓
Bond
      ↓
Molecular Graph
      ↓
Molecule
      ↓
Reaction
```

More explicitly:

```text
Element
  │
  ├── Atomic Number
  ├── Symbol
  ├── Name
  ├── Atomic Mass
  ├── Period
  ├── Group
  └── Isotopes
       │
       ▼
     Atom
       │
       ├── Element
       ├── Isotope
       ├── Charge
       ├── Coordinates
       └── Metadata
             │
             ▼
           Bond
             │
             ├── Atom A
             ├── Atom B
             └── Bond Order
                    │
                    ▼
                 Molecule
```

---

# 4. Element Model

An element is a periodic-table entity.

It is not a specific atom.

Example:

```text
Carbon
```

is an element.

A specific:

```text
Carbon atom #17
```

is an atom instance.

---

# 5. Element Schema

Recommended representation:

```ts
interface ElementDefinition {
    atomicNumber: number;
    symbol: string;
    name: string;

    atomicMass?: number;

    period: number;
    group?: number;

    category?: ElementCategory;

    defaultColor?: string;
    defaultRadius?: number;

    electronegativity?: number;

    commonOxidationStates?: number[];

    isotopes?: IsotopeDefinition[];
}
```

---

# 6. Element Identity

Element identity is determined by:

```text
Atomic Number
```

The atomic number must be authoritative.

For example:

```text
6 → Carbon
7 → Nitrogen
8 → Oxygen
```

Do not use:

```text
Element Name
Symbol
Color
```

as the primary identity.

---

# 7. Element Symbol

Symbols must follow standard chemical capitalization.

Examples:

```text
H
C
N
O
Na
Cl
Fe
Cu
```

Do not accept:

```text
NA
CL
fe
```

as canonical internal representations.

User input may be normalized.

---

# 8. Supported Elements

The initial periodic table should support elements:

```text
Atomic Number 1–118
```

However, not every element must have complete computational support.

The application should distinguish:

```text
Known Element
```

from:

```text
Supported Computational Model
```

---

# 9. Element Data Source

Element data must come from a centralized authoritative dataset.

Do not hard-code element information throughout the UI.

Recommended structure:

```text
data/
└── elements/
    ├── elements.json
    └── isotopes.json
```

---

# 10. Isotopes

An isotope is defined by:

```text
Element
+
Mass Number
```

Example:

```text
Carbon-12
Carbon-13
Carbon-14
```

All have:

```text
Atomic Number = 6
```

but different:

```text
Mass Number
```

---

# 11. Isotope Schema

```ts
interface IsotopeDefinition {
    elementAtomicNumber: number;
    massNumber: number;

    exactMass?: number;

    naturalAbundance?: number;

    radioactive?: boolean;

    halfLife?: number;
}
```

---

# 12. Atom Schema

Recommended:

```ts
interface Atom {
    id: AtomId;

    atomicNumber: number;

    isotope?: number;

    formalCharge: number;

    coordinates: {
        x: number;
        y: number;
        z: number;
    };

    radicalElectrons?: number;

    metadata?: AtomMetadata;
}
```

---

# 13. Atom Identity

An atom must have a unique ID.

Example:

```text
atom_01H82X
```

The ID must remain stable during ordinary editing.

---

# 14. Atom ID vs Element

These are different:

```text
atom.id
```

identifies an individual atom.

```text
atom.atomicNumber
```

identifies its element.

Therefore:

```text
atom_001
atomicNumber = 6
```

means:

```text
Atom #001 is Carbon.
```

---

# 15. Formal Charge

Formal charge belongs to the atom.

Examples:

```text
N+
O-
```

must be represented using:

```ts
formalCharge: 1
formalCharge: -1
```

not as part of the element definition.

---

# 16. Charge Rules

Formal charge may be:

```text
negative
zero
positive
```

Do not artificially restrict atoms to:

```text
-1
0
+1
```

unless a specific validation model requires it.

---

# 17. Molecular Charge

Molecular charge is derived:

```text
Molecular Charge
=
Σ Atom Formal Charges
```

For example:

```text
Atom charges:

O = -1
C = 0
O = -1

Total = -2
```

The molecule should not contain a conflicting independently stored charge unless it is explicitly modeled as a computed/cached property.

---

# 18. Radicals

Radicals must be represented explicitly when supported.

Example:

```ts
radicalElectrons: 1
```

Do not assume:

```text
Unusual valence = radical
```

These are different concepts.

---

# 19. Molecular Graph

A molecule is fundamentally a graph:

```text
G = (V, E)
```

where:

```text
V = atoms
E = bonds
```

The graph represents chemical connectivity.

---

# 20. Molecular Graph Schema

```ts
interface Molecule {
    id: MoleculeId;

    atoms: Atom[];

    bonds: Bond[];

    name?: string;

    metadata?: MoleculeMetadata;
}
```

---

# 21. Bond Schema

```ts
interface Bond {
    id: BondId;

    atomA: AtomId;
    atomB: AtomId;

    order: BondOrder;

    aromatic?: boolean;

    stereochemistry?: BondStereo;
}
```

---

# 22. Bond Order

Bond order must not be stored as an arbitrary string.

Recommended:

```ts
type BondOrder =
    | 1
    | 2
    | 3
    | 1.5;
```

where:

```text
1   = Single
2   = Double
3   = Triple
1.5 = Aromatic representation
```

However, aromaticity should preferably be represented separately from numeric bond order where the underlying chemistry engine supports a richer model.

---

# 23. Bond Type

UI bond types may include:

```text
SINGLE
DOUBLE
TRIPLE
AROMATIC
```

But the chemistry domain should preserve enough information to avoid losing chemical meaning during serialization.

---

# 24. Bond Uniqueness

Two atoms should not normally have multiple identical bonds.

Invalid:

```text
A ─ B
A ─ B
```

as two separate single bonds.

For ordinary molecular structures, represent:

```text
A = B
```

using:

```text
one bond
order = 2
```

---

# 25. Self Bonds

An atom cannot bond to itself.

Invalid:

```text
atomA === atomB
```

The domain layer must reject self-bonds.

---

# 26. Bond References

Every bond must reference existing atoms.

Invalid:

```json
{
    "atomA": "atom_1",
    "atomB": "atom_does_not_exist"
}
```

The molecular graph validator must detect this.

---

# 27. Graph Connectivity

A molecule may contain multiple disconnected components if explicitly allowed.

Example:

```text
Na+ . Cl-
```

is represented as a molecular graph containing two connected components.

Do not automatically merge disconnected components.

---

# 28. Dot-Disconnected Structures

Use disconnected components to represent:

```text
ions
salts
mixtures
complex reaction participants
```

when appropriate.

---

# 29. Molecule vs Mixture

A single molecular graph may contain disconnected components.

However, the application should distinguish:

```text
Molecule
```

from:

```text
Mixture
```

at the application level.

---

# 30. Molecular Formula

Formula generation must be deterministic.

For example:

```text
H2O
CO2
CH4
C6H6
```

Formula generation must count actual atoms.

---

# 31. Formula Ordering

Use standard Hill-system ordering where appropriate:

```text
Carbon
Hydrogen
Other elements alphabetically
```

Example:

```text
C6H6
C2H6O
```

For compounds without carbon, use alphabetical ordering according to the selected formula convention.

---

# 32. Formula Must Respect Isotopes

Isotopic structures should retain isotope information.

Example:

```text
[13C]H4
```

must not silently become:

```text
CH4
```

if isotope identity is scientifically relevant.

---

# 33. Formula Must Respect Charge

Charged structures should preserve charge information.

Examples:

```text
NH4+
SO4^2-
```

Formatting may vary by UI.

Internal representation must remain structured.

---

# 34. Molecular Mass

Molecular mass should be computed from atomic/isotopic masses.

For ordinary molecular weight:

```text
M = Σ atomic masses
```

For explicit isotopes:

```text
M = Σ exact isotope masses
```

when exact-mass mode is selected.

---

# 35. Atomic Mass vs Exact Mass

Do not confuse:

```text
Average Atomic Mass
```

with:

```text
Exact Isotopic Mass
```

The system must expose which calculation mode is being used.

---

# 36. Coordinates

Every atom may contain 3D coordinates:

```ts
{
    x: number;
    y: number;
    z: number;
}
```

These coordinates are molecular coordinates, not screen coordinates.

---

# 37. Coordinate Units

Default molecular coordinate unit:

```text
Ångström (Å)
```

The conversion to rendering units must occur at the rendering boundary.

---

# 38. Coordinate Precision

Do not artificially round coordinates during normal editing.

Internal values may contain floating-point precision.

Display precision may be lower.

---

# 39. 2D Coordinates

2D coordinates may be stored separately when required:

```ts
interface Coordinate2D {
    x: number;
    y: number;
}
```

2D coordinates must not overwrite 3D coordinates.

---

# 40. Coordinate Provenance

Coordinates should have a source:

```text
USER_DEFINED
IMPORTED
GENERATED
OPTIMIZED
COMPUTED
```

---

# 41. Geometry State

A molecule must distinguish:

```text
Connectivity
```

from:

```text
Geometry
```

Two structures may have identical connectivity but different conformations.

---

# 42. Conformation

Conformation refers to the spatial arrangement of a molecule without changing connectivity.

Examples:

```text
Rotation around single bonds
```

may produce different conformations.

---

# 43. Rigid Transformation

A rigid transformation:

```text
translation
rotation
```

does not change molecular connectivity.

It must not modify:

```text
Atom identity
Bond identity
Bond order
```

---

# 44. Geometry Validation

Basic geometry validation may check:

```text
NaN coordinates
Infinite coordinates
Extreme coordinate values
Atom overlap
Impossible distances
```

But geometry warnings must not automatically imply chemical invalidity.

---

# 45. Atomic Radius

The rendering radius of an atom is not necessarily its chemically accurate radius.

Distinguish:

```text
Covalent Radius
Van der Waals Radius
Rendering Radius
```

---

# 46. Radius Source

Chemical radius data must come from a centralized dataset.

Do not derive all atom radii from:

```text
atomic number
```

using an arbitrary formula.

---

# 47. Bond Length

Bond length should be computed from coordinates:

```text
d = ||rA - rB||
```

where:

```text
rA = Atom A coordinates
rB = Atom B coordinates
```

---

# 48. Bond Length Units

Bond lengths are displayed by default in:

```text
Å
```

---

# 49. Bond Length Validation

A bond-length warning may be generated if:

```text
distance
```

is significantly outside an expected range.

However, the validator must consider:

```text
Elements
Bond Order
Charge
Aromaticity
Geometry State
```

before declaring a structure invalid.

---

# 50. Valence

Valence validation must not use simplistic bond counting alone.

For example:

```text
Number of bonds
```

is not always equal to:

```text
Valence
```

Bond order, charge, aromaticity, and element-specific behavior must be considered.

---

# 51. Valence Model

The initial validator should use a configurable valence model.

Conceptually:

```text
Element
+
Charge
+
Bond Orders
+
Aromaticity
+
Radical State
```

→

```text
Valence Assessment
```

---

# 52. Valence Result

The validator should return:

```ts
type ValenceStatus =
    | "VALID"
    | "UNUSUAL"
    | "INVALID"
    | "UNKNOWN";
```

---

# 53. Unknown Chemistry

If the system cannot determine validity reliably:

```text
UNKNOWN
```

is preferable to:

```text
INVALID
```

Do not convert lack of knowledge into a false negative.

---

# 54. Aromaticity

Aromaticity must not be determined solely from visual appearance.

It should be derived from:

```text
Chemical Perception
```

or imported from a trusted chemistry engine.

---

# 55. Aromatic Bonds

Aromatic bonds should support an explicit representation:

```text
aromatic = true
```

when appropriate.

---

# 56. Kekulization

If a chemistry engine converts aromatic systems into alternating single/double bonds, the system must preserve enough information to reconstruct the aromatic representation when needed.

---

# 57. Aromatic Ring Detection

Do not implement:

```text
if ring.length === 6
```

then:

```text
aromatic = true
```

This is chemically incorrect.

---

# 58. Rings

Ring detection should be graph-based.

The system should support identification of:

```text
Simple Rings
Fused Rings
Bridged Rings
Spiro Systems
```

where the underlying algorithm supports them.

---

# 59. Ring Perception

Ring perception must be separated from:

```text
Rendering
```

and:

```text
UI
```

---

# 60. Stereochemistry

The chemistry model should support stereochemical metadata.

Potential types:

```text
Tetrahedral chirality
Double-bond stereochemistry
```

---

# 61. Tetrahedral Chirality

Where supported, chirality must be associated with:

```text
Atom
+
Neighbor ordering
+
Stereo descriptor
```

Do not infer chirality merely from 3D visual orientation without defined stereochemical rules.

---

# 62. Double-Bond Stereochemistry

Double-bond stereochemistry should support concepts such as:

```text
E
Z
```

where chemically defined.

---

# 63. 3D Geometry and Stereochemistry

A 3D structure can visually appear chiral without having a formally defined stereochemical assignment.

Therefore:

```text
3D shape ≠ automatically assigned stereochemistry
```

---

# 64. Hydrogen Representation

Hydrogens may be:

```text
Explicit
Implicit
```

The molecule model must know which mode is being used.

---

# 65. Explicit Hydrogens

Explicit hydrogen atoms have their own:

```text
Atom ID
Coordinates
Bonds
```

---

# 66. Implicit Hydrogens

Implicit hydrogens are inferred from the chemical representation.

They should not automatically become explicit atoms unless the user or engine requests hydrogen expansion.

---

# 67. Hydrogen Expansion

Hydrogen expansion should be deterministic.

Example:

```text
Carbon
+
appropriate valence
```

may result in inferred hydrogens.

But this must use the active chemical perception model.

---

# 68. Hydrogen Removal

Removing explicit hydrogens must not silently alter the intended chemical structure.

Before removing them:

```text
Recalculate implicit hydrogen representation.
```

---

# 69. Chemical Normalization

Normalization may include:

```text
Charge normalization
Aromaticity normalization
Hydrogen normalization
Bond normalization
```

Normalization must be explicit.

Do not silently alter user-created structures unless the operation is clearly documented.

---

# 70. Structure Sanitization

Sanitization should be treated as a computational operation.

Possible stages:

```text
Parse
 ↓
Connectivity Check
 ↓
Valence Check
 ↓
Charge Check
 ↓
Aromaticity Perception
 ↓
Hydrogen Perception
 ↓
Stereo Perception
```

---

# 71. Sanitization Result

Sanitization should return structured results:

```ts
interface SanitizationResult {
    valid: boolean;

    molecule?: Molecule;

    errors: ChemistryIssue[];
    warnings: ChemistryIssue[];
}
```

---

# 72. Validation Levels

AtomSynthesizer should use multiple validation levels.

```text
LEVEL 0 — Structural
LEVEL 1 — Graph
LEVEL 2 — Chemical
LEVEL 3 — Geometry
LEVEL 4 — Computational
```

---

# 73. Level 0 — Structural Validation

Check:

```text
IDs
Required fields
Data types
Finite numbers
Valid references
```

---

# 74. Level 1 — Graph Validation

Check:

```text
Self-bonds
Missing atoms
Duplicate bonds
Broken references
Graph consistency
```

---

# 75. Level 2 — Chemical Validation

Check:

```text
Valence
Formal charge
Aromaticity
Hydrogen count
Bond order
Chemical perception
```

---

# 76. Level 3 — Geometry Validation

Check:

```text
Atom distances
Bond lengths
Angles
Overlaps
Coordinate validity
```

---

# 77. Level 4 — Computational Validation

This depends on external chemistry engines.

Possible:

```text
Energy calculation
Geometry optimization
Electronic structure
Conformer generation
Reaction feasibility prediction
```

These results must never be simulated using fake values.

---

# 78. Validation Issue

Recommended schema:

```ts
interface ChemistryIssue {
    code: string;

    severity:
        | "ERROR"
        | "WARNING"
        | "INFO";

    message: string;

    atomIds?: AtomId[];

    bondIds?: BondId[];

    details?: Record<string, unknown>;
}
```

---

# 79. Validation Codes

Use machine-readable codes.

Examples:

```text
ATOM_UNKNOWN
ATOM_INVALID
BOND_SELF_REFERENCE
BOND_DUPLICATE
BOND_INVALID_ORDER
ATOM_VALENCE_UNUSUAL
ATOM_VALENCE_INVALID
CHARGE_UNUSUAL
AROMATICITY_UNDEFINED
COORDINATE_INVALID
BOND_LENGTH_UNUSUAL
```

---

# 80. Errors vs Warnings

Use `ERROR` only when the system has strong evidence.

Use `WARNING` when:

```text
Structure is unusual
```

but potentially meaningful.

Use `INFO` for informational observations.

---

# 81. Reaction Model

A reaction is represented as:

```text
Reactants
+
Agents/Conditions
→
Products
```

---

# 82. Reaction Schema

Recommended:

```ts
interface Reaction {
    id: ReactionId;

    reactants: ReactionParticipant[];

    agents?: ReactionParticipant[];

    products: ReactionParticipant[];

    conditions?: ReactionConditions;

    atomMapping?: AtomMapping[];

    metadata?: ReactionMetadata;
}
```

---

# 83. Reaction Participant

```ts
interface ReactionParticipant {
    moleculeId: MoleculeId;

    role:
        | "REACTANT"
        | "AGENT"
        | "CATALYST"
        | "SOLVENT"
        | "PRODUCT";

    coefficient?: number;
}
```

---

# 84. Reaction Conditions

Possible metadata:

```ts
interface ReactionConditions {
    temperature?: {
        value: number;
        unit: "K" | "C";
    };

    pressure?: {
        value: number;
        unit: "Pa" | "bar" | "atm";
    };

    solvent?: string[];

    duration?: {
        value: number;
        unit: string;
    };

    atmosphere?: string;
}
```

---

# 85. Conditions Are Metadata

Entering:

```text
Temperature = 300 K
```

does not mean the system has simulated the effect of 300 K.

Conditions must only influence computation if the selected chemistry engine actually supports them.

---

# 86. Reaction Atom Mapping

Reaction mapping links equivalent atoms between:

```text
Reactants
```

and:

```text
Products
```

---

# 87. Mapping Schema

```ts
interface AtomMapping {
    reactantAtomId: AtomId;

    productAtomId: AtomId;
}
```

---

# 88. Atom Mapping Integrity

A mapped atom must exist on both sides.

Invalid mappings must be rejected.

---

# 89. Reaction Difference

The reaction engine should calculate:

```text
Bonds Broken
Bonds Formed
Bond Orders Changed
Atoms Added
Atoms Removed
Charges Changed
```

---

# 90. Bond Change

```ts
interface BondChange {
    type:
        | "FORMED"
        | "BROKEN"
        | "ORDER_CHANGED";

    reactantBond?: BondId;

    productBond?: BondId;

    atomA: AtomId;

    atomB: AtomId;

    oldOrder?: number;

    newOrder?: number;
}
```

---

# 91. Reaction Visualization

Reaction animation should be generated from:

```text
Reactant Geometry
+
Product Geometry
+
Atom Mapping
+
Bond Changes
```

---

# 92. Reaction Animation Must Not Modify Chemistry

Animation is presentation.

Playing an animation must not alter the stored reaction.

---

# 93. Reaction Mechanisms

A reaction transformation is not automatically a mechanism.

The system must distinguish:

```text
Reaction Transformation
```

from:

```text
Reaction Mechanism
```

---

# 94. Mechanistic Steps

If mechanism data exists, represent individual steps:

```ts
interface ReactionStep {
    reactants: MoleculeId[];

    products: MoleculeId[];

    electronFlow?: ElectronFlow[];

    description?: string;
}
```

---

# 95. Electron Flow

Electron movement must not be fabricated.

If electron-flow information is unavailable:

```text
electronFlow = undefined
```

not:

```text
random arrows
```

---

# 96. Reaction Prediction

Reaction prediction is probabilistic/computational unless proven otherwise.

Output should contain:

```text
Prediction
Confidence
Method
Engine
Warnings
```

---

# 97. Prediction Confidence

Do not interpret:

```text
confidence = 0.8
```

as:

```text
80% probability that the reaction works experimentally
```

unless the underlying model explicitly defines it that way.

---

# 98. Reaction Feasibility

A predicted product does not imply:

```text
synthetically feasible
```

A reaction prediction system should distinguish:

```text
Product Prediction
Reaction Feasibility
Synthetic Accessibility
Experimental Validation
```

---

# 99. AI-Generated Molecules

AI-generated molecules must enter the system through the same pipeline as user-created molecules.

```text
AI
 ↓
Parse
 ↓
Schema Validation
 ↓
Chemical Validation
 ↓
Domain Model
```

---

# 100. AI Must Not Create Raw Domain State

AI should produce a structured intermediate representation.

Example:

```json
{
    "operation": "ADD_BOND",
    "atomA": "atom_01",
    "atomB": "atom_02",
    "bondOrder": 1
}
```

The application then validates it.

---

# 101. SMILES

If SMILES is supported, treat it as a chemical interchange representation.

Workflow:

```text
SMILES
 ↓
Parser
 ↓
Molecular Graph
 ↓
Validation
```

---

# 102. SMILES Export

Export should be deterministic where canonicalization is supported.

Do not implement a fake canonicalization algorithm.

Use a trusted chemistry engine where necessary.

---

# 103. InChI

If InChI support is added, it must be implemented through an appropriate chemistry library.

Do not manually reproduce the InChI algorithm.

---

# 104. SDF / MOL

If MOL/SDF support is added:

```text
File
 ↓
Parser
 ↓
Validation
 ↓
Molecular Graph
```

Never directly trust imported bond or atom data.

---

# 105. XYZ

XYZ primarily provides:

```text
Element
X
Y
Z
```

It may not provide complete:

```text
Bond Information
Formal Charges
Stereochemistry
```

Therefore XYZ import must not pretend that all chemical information is known.

---

# 106. XYZ Import State

Imported XYZ structures should be marked:

```text
Connectivity:
UNKNOWN
```

until connectivity is inferred or supplied.

---

# 107. MOL/SDF Advantage

Formats such as MOL/SDF may provide:

```text
Atoms
Coordinates
Bonds
Charges
Metadata
```

depending on the file.

The parser must preserve available information.

---

# 108. File Format Metadata

Imported structures should retain provenance:

```text
sourceFormat
sourceFile
importTimestamp
parserVersion
```

where appropriate.

---

# 109. Molecular Fingerprints

Fingerprints should not be implemented manually unless required.

Use established chemistry libraries.

Possible future support:

```text
Morgan/ECFP
MACCS
Other fingerprints
```

---

# 110. Molecular Similarity

Similarity calculations must specify:

```text
Fingerprint
Similarity Metric
Parameters
```

Do not display a similarity number without explaining the method.

---

# 111. Substructure Search

Substructure matching must be graph-based.

Do not perform:

```text
string contains()
```

on molecular formulas to determine substructure.

---

# 112. Molecular Formula Is Not Molecular Identity

These molecules may share a formula but differ structurally.

Therefore:

```text
Formula Equality
≠
Molecular Identity
```

---

# 113. Stereochemistry Matters

Two structures can have:

```text
same connectivity
same formula
```

but different stereochemistry.

Therefore stereochemical information must be preserved.

---

# 114. Tautomers

Tautomers may have:

```text
same molecular formula
```

but different:

```text
bond placement
hydrogen placement
charge distribution
```

Do not automatically collapse tautomers unless the user explicitly requests normalization.

---

# 115. Resonance

Resonance structures may represent different valid drawings of the same electronic system.

Do not automatically treat every resonance representation as a different molecule.

---

# 116. Canonicalization

Canonicalization must be explicit.

Possible operations:

```text
Canonicalize Structure
Canonicalize SMILES
Normalize Aromaticity
Normalize Charges
```

Canonicalization should not happen invisibly during every edit.

---

# 117. Molecule Equality

Molecule equality must specify the comparison level.

Possible:

```text
Graph Equality
Formula Equality
Stereo-Aware Equality
3D Geometry Similarity
```

Never define one universal `equals()` without specifying semantics.

---

# 118. Molecular Graph Equality

Graph equality should consider:

```text
Atom identity by chemical properties
Bond connectivity
Bond order
Charge
Isotope
Stereochemistry
```

depending on the selected equality mode.

---

# 119. 3D Molecular Equality

3D coordinate comparison must account for:

```text
Translation
Rotation
Reflection
```

depending on the scientific question.

A molecule rotated in space is not automatically a different molecule.

---

# 120. Mirror Images

Mirror-related structures may represent:

```text
enantiomers
```

and must not automatically be treated as identical.

---

# 121. Geometry Optimization

Geometry optimization is a computational operation.

It must specify:

```text
Method
Force Field / Theory
Parameters
Convergence Criteria
```

where supported.

---

# 122. Geometry Optimization Result

A successful optimization should return:

```text
Optimized Coordinates
Energy
Convergence Status
Method
Parameters
Warnings
```

---

# 123. No Fake Optimization

Never implement:

```text
Move atoms toward average distance
```

and label it:

```text
Energy Optimization
```

unless an actual objective function and optimization algorithm are being used.

---

# 124. Energy

Energy values must always specify:

```text
Value
Unit
Method
Reference
```

---

# 125. Energy Comparisons

Do not compare energies from different methods as if they were directly interchangeable.

---

# 126. Force Fields

If force-field support is implemented, the system must identify:

```text
Force Field Name
Version
Parameters
```

---

# 127. Quantum Chemistry

Quantum calculations belong to an external computation layer unless a suitable engine is intentionally integrated.

Potential methods include:

```text
HF
DFT
MP2
Semi-empirical
```

but support must be explicit.

---

# 128. Quantum Results

Quantum calculations must not be simulated by frontend heuristics.

---

# 129. Molecular Properties

Potential computed properties include:

```text
Molecular Formula
Molecular Mass
Formal Charge
Atom Count
Heavy Atom Count
Hydrogen Count
Bond Count
Ring Count
Rotatable Bonds
```

These should be calculated from the molecular model or trusted chemistry engine.

---

# 130. Property Provenance

Every non-trivial property should ideally identify:

```text
Computed By
Method
Timestamp
```

when generated by an external engine.

---

# 131. Chemical Database

External chemical databases may be integrated later.

Imported information should retain:

```text
Source
Identifier
Version
Timestamp
```

where possible.

---

# 132. External Data Trust

External data must not overwrite user structures automatically.

Imported data should be treated as:

```text
External Reference
```

until explicitly accepted.

---

# 133. Safety Metadata

The system may optionally display chemical safety metadata.

Examples:

```text
Hazard Classification
Toxicity Information
Flammability
Corrosivity
```

Such information must come from authoritative sources.

---

# 134. Safety Is Not Inferred

Do not infer:

```text
safe
toxic
explosive
stable
unstable
```

merely from molecular geometry or atom count.

---

# 135. Stability

Structural validity does not mean thermodynamic stability.

These are different:

```text
Valid Structure
Stable Molecule
Synthesizable Molecule
Experimentally Observed Molecule
```

---

# 136. Synthesizability

The platform must never claim synthesizability solely from:

```text
valid molecular graph
```

or:

```text
AI-generated structure
```

---

# 137. Experimental Verification

Only experimental data should be described as experimentally verified.

Computational output must be labeled appropriately.

---

# 138. Scientific Confidence Levels

Recommended:

```text
EXPERIMENTALLY_VERIFIED
COMPUTATIONALLY_SUPPORTED
PREDICTED
HYPOTHETICAL
USER_DEFINED
UNKNOWN
```

---

# 139. Chemical Provenance

For important structures, maintain:

```ts
interface Provenance {
    source:
        | "USER"
        | "IMPORT"
        | "AI"
        | "DATABASE"
        | "COMPUTATION";

    sourceId?: string;

    engine?: string;

    engineVersion?: string;

    method?: string;

    createdAt: string;
}
```

---

# 140. Chemistry Engine Adapter

External engines must be hidden behind interfaces.

Example:

```ts
interface ChemistryEngine {
    validate(
        molecule: Molecule
    ): Promise<ValidationResult>;

    perceiveAromaticity(
        molecule: Molecule
    ): Promise<Molecule>;

    generateFormula(
        molecule: Molecule
    ): Promise<string>;

    calculateProperties(
        molecule: Molecule
    ): Promise<MolecularProperties>;
}
```

---

# 141. Multiple Chemistry Engines

The architecture must allow:

```text
RDKit
Open Babel
Custom Engine
Future WASM Engine
External Compute Service
```

without changing the UI domain model.

---

# 142. Engine Capabilities

Each engine should expose capabilities.

Example:

```ts
interface ChemistryEngineCapabilities {
    smiles: boolean;
    sdf: boolean;
    xyz: boolean;
    aromaticity: boolean;
    stereochemistry: boolean;
    conformerGeneration: boolean;
    geometryOptimization: boolean;
    reactionPrediction: boolean;
}
```

---

# 143. Unsupported Operations

If an engine does not support an operation:

```text
UNSUPPORTED
```

must be returned.

Do not fabricate a result.

---

# 144. Chemistry Operation Result

Use structured results:

```ts
interface ChemistryResult<T> {
    status:
        | "SUCCESS"
        | "WARNING"
        | "ERROR"
        | "UNSUPPORTED";

    value?: T;

    warnings?: ChemistryIssue[];

    errors?: ChemistryIssue[];

    provenance?: Provenance;
}
```

---

# 145. Determinism

Operations should be deterministic where practical.

Random algorithms must support a seed where possible.

---

# 146. Random Seeds

For stochastic operations such as:

```text
Conformer Generation
AI Sampling
Monte Carlo
```

store the seed when reproducibility matters.

---

# 147. Molecular Search

Search should support:

```text
Name
Formula
SMILES
InChI
Atomic composition
Molecular properties
```

where implemented.

---

# 148. Search Must Not Mutate

Searching must never modify molecular state.

---

# 149. Molecular Editing

Supported basic operations:

```text
Add Atom
Delete Atom
Move Atom
Change Element
Change Charge
Change Isotope
Add Bond
Delete Bond
Change Bond Order
```

---

# 150. Add Atom Rules

Adding an atom requires:

```text
Valid Element
Unique Atom ID
Valid Coordinates
Valid Charge
```

---

# 151. Delete Atom Rules

Deleting an atom must also handle its connected bonds.

Workflow:

```text
Delete Atom
 ↓
Find Connected Bonds
 ↓
Delete Bonds
 ↓
Delete Atom
```

The operation must be atomic.

---

# 152. Change Element

Changing:

```text
Carbon → Oxygen
```

may invalidate existing bonds.

The system must re-run validation.

---

# 153. Change Charge

Changing formal charge must trigger:

```text
Valence Validation
Formula Update
Property Update
```

where applicable.

---

# 154. Change Isotope

Changing isotope must trigger:

```text
Mass Recalculation
Formula Update
```

where applicable.

---

# 155. Bond Creation

Bond creation must validate:

```text
Atom existence
Atom uniqueness
Self-bond
Duplicate bond
Bond order
Chemical validity
```

---

# 156. Bond Order Change

Changing:

```text
single → double
```

must trigger chemical validation.

---

# 157. Automatic Hydrogen Adjustment

Automatic hydrogen adjustment must be explicit.

The UI should not silently change hydrogen representation during unrelated edits unless that behavior is clearly defined by the active editing mode.

---

# 158. Editing Modes

Recommended modes:

```text
STRICT
BALANCED
FREEFORM
```

### STRICT

Reject chemically invalid structures.

### BALANCED

Allow unusual structures with warnings.

### FREEFORM

Prioritize graph editing while clearly displaying chemical warnings.

---

# 159. Default Editing Mode

Recommended default:

```text
BALANCED
```

This prevents the editor from becoming unusably restrictive.

---

# 160. Freeform Structures

Freeform mode is still subject to:

```text
Structural Integrity
```

A broken bond reference is never acceptable.

Chemical unusualness is different from corrupted data.

---

# 161. Reaction Editing

Reaction editing should support:

```text
Add Reactant
Remove Reactant
Add Product
Remove Product
Add Agent
Define Mapping
Compare Structures
```

---

# 162. Reaction Validation

Validate:

```text
Participant references
Atom mappings
Bond changes
Charge conservation
Element conservation
```

where chemically appropriate.

---

# 163. Atom Conservation

For ordinary reactions:

```text
Elements on reactant side
```

should generally match:

```text
Elements on product side
```

unless the reaction representation explicitly includes:

```text
Byproducts
External Reagents
Leaving Groups
Spectator Species
```

---

# 164. Charge Conservation

For a properly represented reaction:

```text
Total Reactant Charge
=
Total Product Charge
```

unless charge is exchanged with an explicitly modeled external system.

---

# 165. Conservation Warnings

If conservation fails:

```text
WARNING or ERROR
```

depending on representation completeness.

Do not automatically declare the reaction impossible if participants may be omitted intentionally.

---

# 166. Reaction Balance

Reaction coefficients should be supported where required.

Example:

```text
2H2 + O2 → 2H2O
```

---

# 167. Stoichiometric Coefficients

Coefficients should be represented separately from atom counts.

```ts
coefficient: 2
```

must not duplicate the molecule internally.

---

# 168. Reaction Equation

The displayed equation should be generated from:

```text
Participants
+
Coefficients
+
Molecular Representation
```

not manually typed strings.

---

# 169. Chemical Notation

The UI should use standard notation where practical:

```text
H₂O
CO₂
NH₄⁺
SO₄²⁻
```

Internal storage should remain machine-readable.

---

# 170. Rendering Chemistry

The renderer should visualize:

```text
Atoms
Bonds
Charges
Isotopes
Hydrogens
Stereochemistry
```

only when the corresponding data exists.

---

# 171. Renderer Must Not Infer Chemistry

The renderer may infer visual properties such as:

```text
Bond cylinder orientation
Atom sphere size
```

but must not infer:

```text
Valence
Aromaticity
Reaction feasibility
```

---

# 172. Bond Visualization

Recommended rendering:

```text
Single → one cylinder
Double → two cylinders
Triple → three cylinders
Aromatic → aromatic representation
```

The exact visual style is configurable.

---

# 173. Space-Filling Mode

Space-filling mode should use appropriate atomic radii.

It should not alter molecular coordinates.

---

# 174. Ball-and-Stick Mode

Ball-and-stick mode is a rendering configuration.

It must not alter:

```text
Bond lengths
Atomic positions
Chemical identity
```

---

# 175. Selection

Selecting an atom changes:

```text
UI State
```

not:

```text
Molecular Structure
```

---

# 176. Measurements

Measurements must operate on actual molecular coordinates.

Examples:

```text
Distance
Angle
Dihedral
```

---

# 177. Distance

For atoms A and B:

```text
d(A,B)
=
√((xA-xB)² + (yA-yB)² + (zA-zB)²)
```

---

# 178. Angle

For A-B-C:

```text
θ
=
angle(A-B, C-B)
```

---

# 179. Dihedral

For A-B-C-D:

```text
φ
=
dihedral(A,B,C,D)
```

The implementation must correctly handle orientation/sign conventions.

---

# 180. Measurement Precision

Display precision must be configurable.

Example:

```text
Distance: 1.43 Å
```

rather than exposing excessive floating-point noise.

---

# 181. Molecular Center

The application may calculate:

```text
Geometric Center
Center of Mass
```

These are distinct quantities.

---

# 182. Center of Mass

Center of mass must use atomic masses:

```text
Rcm = Σ(mi * ri) / Σmi
```

---

# 183. Geometry Center

Geometric center may use:

```text
average coordinates
```

without mass weighting.

Do not confuse the two.

---

# 184. Bounding Box

The 3D renderer may calculate:

```text
Bounding Box
Bounding Sphere
```

for camera framing.

These are rendering utilities, not chemical properties.

---

# 185. Camera Framing

"Focus molecule" must use molecular coordinates and renderer bounds.

It must not modify the molecule.

---

# 186. Chemical Metadata

Metadata may contain:

```text
name
synonyms
source
CAS number
database IDs
notes
tags
```

where available.

---

# 187. Metadata Must Not Become Chemistry

A string such as:

```text
"water"
```

does not establish that the molecule is H₂O.

Chemical identity must come from structured data.

---

# 188. Validation Pipeline

Every molecular structure entering the domain should follow:

```text
Input
 ↓
Schema Validation
 ↓
Graph Validation
 ↓
Chemical Validation
 ↓
Optional Geometry Validation
 ↓
Accepted Domain Model
```

---

# 189. Mutation Pipeline

Every mutation should follow:

```text
User/AI Action
 ↓
Command
 ↓
Schema Validation
 ↓
Domain Mutation
 ↓
Chemical Validation
 ↓
State Update
```

---

# 190. Import Pipeline

```text
File
 ↓
Format Detection
 ↓
Parser
 ↓
Intermediate Representation
 ↓
Schema Validation
 ↓
Chemical Validation
 ↓
Molecular Graph
```

---

# 191. Export Pipeline

```text
Molecular Graph
 ↓
Normalization if requested
 ↓
Exporter
 ↓
Target Format
```

---

# 192. Save Pipeline

```text
Molecule
 ↓
Serialization Schema
 ↓
Schema Version
 ↓
Persistence
```

---

# 193. Serialization Invariant

Serialization and deserialization should preserve, where supported:

```text
Atom IDs
Elements
Isotopes
Charges
Coordinates
Bonds
Bond Orders
Stereochemistry
Metadata
```

---

# 194. No Information Loss Without Warning

If an export format cannot represent a property:

```text
Warning:
Target format cannot preserve stereochemical metadata.
```

Do not silently discard it.

---

# 195. Versioning

Molecular project schema must be versioned.

Example:

```json
{
    "schemaVersion": 1
}
```

---

# 196. Migration

Future schema changes must use migrations.

Example:

```text
Schema v1
 ↓
Migration
 ↓
Schema v2
```

---

# 197. Chemistry Engine Provenance

Computed structures must preserve:

```text
Engine
Version
Method
Parameters
Input Hash
Timestamp
```

where practical.

---

# 198. Input Hash

For reproducibility, computational jobs may store a hash of the molecular input.

Example:

```text
inputHash
```

This helps determine exactly which structure generated a result.

---

# 199. Result Caching

Computational results may be cached using:

```text
Input Structure Hash
+
Engine
+
Engine Version
+
Method
+
Parameters
```

as the cache identity.

---

# 200. Cache Invalidation

Changing any chemically relevant input must invalidate dependent results.

Example:

```text
Change Bond Order
 ↓
Old Optimization Result
 ↓
Invalid
```

---

# 201. Derived Properties

Properties such as:

```text
Formula
Mass
Charge
Ring Count
```

should be treated as derived data.

They should either be:

```text
recomputed
```

or:

```text
invalidated and recalculated
```

after molecular changes.

---

# 202. Dependency Graph

Derived data should conceptually follow:

```text
Atoms + Bonds
      ↓
Connectivity
      ↓
Formula
      ↓
Mass
      ↓
Chemical Properties
```

---

# 203. No Stale Scientific Data

Do not display cached properties if their input structure has changed.

---

# 204. Molecular Hash

A canonical molecular hash may be introduced for:

```text
Caching
Deduplication
Search
Comparison
```

It must be based on chemical representation, not 3D rendering state.

---

# 205. Rendering State Must Not Affect Molecular Hash

Changing:

```text
Camera
Color
Rendering Mode
Selection
Lighting
```

must not change molecular identity.

---

# 206. Coordinate Hash

If geometry is relevant, maintain a separate geometry hash.

This allows:

```text
Chemical Identity
```

and:

```text
Geometry Identity
```

to remain distinct.

---

# 207. Reaction Hash

A reaction hash should account for:

```text
Reactants
Products
Mappings
Coefficients
```

depending on the required comparison mode.

---

# 208. Chemical Equality Modes

Support explicit comparison modes:

```text
FORMULA
GRAPH
GRAPH_STEREO
GEOMETRY
REACTION
```

---

# 209. Formula Equality

Checks only elemental composition and isotope information where applicable.

---

# 210. Graph Equality

Checks:

```text
Connectivity
Bond Orders
Element Identity
Charge
Isotope
```

depending on configuration.

---

# 211. Stereo Graph Equality

Additionally checks:

```text
Stereochemical configuration
```

---

# 212. Geometry Equality

Checks coordinate arrangement after applying an appropriate alignment method.

---

# 213. No Universal Similarity

Never report:

```text
Similarity = 95%
```

without specifying:

```text
Similarity Method
```

---

# 214. Chemical Search Index

Future database indexing may include:

```text
Formula
Canonical SMILES
InChI
Fingerprint
Molecular Weight
Element Composition
```

---

# 215. Database Representation

The persistent database representation may differ from the in-memory domain representation.

Example:

```text
PostgreSQL
 ↓
Repository
 ↓
Domain Molecule
```

---

# 216. Database Must Not Become Domain

Do not design chemistry around:

```text
Prisma schema limitations
```

The domain model remains authoritative.

---

# 217. Error Handling

Chemistry operations must use structured errors.

Example:

```ts
class ChemistryError extends Error {
    code: string;
    severity: "ERROR" | "WARNING";
}
```

---

# 218. Never Return Fake Results

If an engine fails:

```text
status = ERROR
```

Do not return:

```text
0
null pretending success
random coordinates
estimated energy
```

without explicitly labeling the result as an approximation.

---

# 219. Approximation

Approximate algorithms are allowed if explicitly documented.

Every approximation should identify:

```text
Method
Assumption
Expected Accuracy
Limitations
```

---

# 220. Scientific Boundaries

The application must distinguish:

```text
Chemical Rule
```

from:

```text
Heuristic
```

from:

```text
Machine Learning Prediction
```

from:

```text
Experimental Evidence
```

---

# 221. Scientific Language

Use:

```text
Predicted
Computed
Estimated
Approximate
Hypothetical
User-defined
```

when appropriate.

Avoid:

```text
Guaranteed
Proven
Safe
Stable
Synthesizable
```

unless evidence supports the statement.

---

# 222. Core Chemical Invariants

The following must always hold:

```text
1. Every bond references existing atoms.

2. An atom cannot bond to itself.

3. Atom IDs are unique.

4. Bond IDs are unique.

5. Bond references are valid.

6. Element atomic numbers are valid.

7. Coordinates must be finite.

8. Molecular charge equals the sum of formal charges
   unless a different charge model is explicitly represented.

9. Derived properties must correspond to the current structure.

10. Rendering state cannot alter chemical identity.

11. Camera transformations cannot alter molecular structure.

12. AI output must pass the same validation as user input.

13. Imported structures must be validated.

14. Unsupported chemistry must be reported as unsupported,
    not fabricated.

15. Predicted structures must not be presented as experimentally verified.
```

---

# 223. Minimum MVP Chemistry Support

The MVP should support:

```text
118 Elements
Atom Creation
Atom Deletion
Atom Movement
Formal Charge
Basic Isotopes
Single Bonds
Double Bonds
Triple Bonds
Basic Aromatic Bonds
Molecular Graph
Formula Generation
Molecular Mass
Basic Valence Validation
3D Coordinates
Distance Measurement
Angle Measurement
Basic Reaction Representation
Reaction Atom Mapping
Bond Change Detection
Molecule Import/Export
```

---

# 224. Post-MVP Chemistry Support

Future versions may add:

```text
Advanced Stereochemistry
Conformer Generation
Force Fields
Geometry Optimization
Substructure Search
Fingerprints
Molecular Similarity
Reaction Prediction
Synthetic Accessibility
Quantum Chemistry
Electron Density
Orbital Visualization
Molecular Dynamics
```

These must be implemented as independent computational modules.

---

# 225. Chemistry Architecture

The recommended chemistry subsystem:

```text
chemistry/
│
├── domain/
│   ├── atom/
│   ├── bond/
│   ├── molecule/
│   ├── reaction/
│   ├── element/
│   └── validation/
│
├── application/
│   ├── molecule/
│   ├── reaction/
│   ├── analysis/
│   └── import-export/
│
├── engines/
│   ├── interfaces/
│   └── adapters/
│
├── parsers/
│   ├── smiles/
│   ├── xyz/
│   ├── mol/
│   └── sdf/
│
├── serializers/
│
└── data/
    ├── elements/
    └── isotopes/
```

---

# 226. Domain Layer

The domain layer contains:

```text
Atom
Bond
Molecule
Reaction
Element
Validation
Chemical invariants
```

No framework dependencies.

---

# 227. Application Layer

The application layer coordinates:

```text
Commands
Analysis
Import
Export
Reaction processing
Chemistry engines
```

---

# 228. Engine Layer

The engine layer integrates:

```text
RDKit
Open Babel
Custom Chemistry Engines
WASM Engines
External Compute Services
```

through adapters.

---

# 229. Parser Layer

Parsers convert:

```text
External Representation
```

into:

```text
Intermediate Chemical Representation
```

---

# 230. Renderer Boundary

The renderer consumes:

```text
Molecule
```

through a render adapter.

```text
Molecule
 ↓
RenderModel
 ↓
Three.js
```

---

# 231. Render Model

A render model may contain:

```ts
interface AtomRenderModel {
    id: string;
    position: [number, number, number];
    radius: number;
    color: string;
}

interface BondRenderModel {
    id: string;
    atomA: string;
    atomB: string;
    order: number;
}
```

---

# 232. Render Model Is Derived

Render models must be regenerated or updated when the molecular model changes.

They are not the source of truth.

---

# 233. Chemistry Events

Domain/application events may include:

```text
AtomAdded
AtomRemoved
BondAdded
BondRemoved
BondOrderChanged
AtomChargeChanged
MoleculeChanged
ReactionChanged
```

---

# 234. Event Consumers

Events may be consumed by:

```text
Renderer
History
Persistence
Analytics
UI
```

but chemistry must not depend on UI consumers.

---

# 235. Event Payloads

Events should contain IDs and relevant structured information.

Avoid passing:

```text
React components
THREE.Mesh
DOM elements
```

---

# 236. Undo/Redo

Chemical commands must be reversible.

Examples:

```text
AddAtom
DeleteAtom
AddBond
DeleteBond
ChangeBondOrder
ChangeCharge
MoveAtom
```

---

# 237. Command Atomicity

A command must either:

```text
fully succeed
```

or:

```text
leave the previous valid state intact
```

---

# 238. Transactional Editing

For complex operations:

```text
Change Element
+
Adjust Hydrogen
+
Update Bonds
```

must behave as one logical operation.

---

# 239. Batch Operations

Batch edits should support:

```text
Begin Transaction
 ↓
Multiple Changes
 ↓
Validate
 ↓
Commit
```

or:

```text
Rollback
```

---

# 240. Performance

Chemical operations must not unnecessarily block rendering.

Large calculations should use:

```text
Web Worker
WASM
Server Job
```

depending on workload.

---

# 241. Chemistry Worker

The worker may perform:

```text
Parsing
Validation
Formula Calculation
Graph Analysis
Fingerprint Generation
Conformer Generation
```

depending on implementation.

---

# 242. Worker Restrictions

Workers must communicate using:

```text
Serializable Messages
```

not:

```text
Three.js Objects
React State
DOM Objects
```

---

# 243. Large Molecules

The chemistry engine must be capable of handling molecules larger than the UI's default rendering target.

Rendering optimization and chemistry computation are separate concerns.

---

# 244. Progressive Computation

For expensive analysis:

```text
Input
 ↓
Quick Validation
 ↓
Immediate UI Result
 ↓
Deep Analysis
 ↓
Detailed Result
```

where appropriate.

---

# 245. Result Status

Every expensive operation should expose:

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED
```

---

# 246. Cancellation

Cancelled computations must not update the molecule with partial results.

---

# 247. Partial Results

Partial results must be explicitly marked:

```text
PARTIAL
```

and must not masquerade as completed calculations.

---

# 248. Numerical Stability

Numerical calculations should account for floating-point tolerance.

Do not compare floating-point values using exact equality where inappropriate.

Bad:

```ts
distance === 1.0
```

Prefer:

```text
|distance - expected| < tolerance
```

---

# 249. Tolerance

Tolerance must be method-specific.

Do not define one global:

```text
0.001
```

for every chemistry operation.

---

# 250. Angle Tolerance

Angular comparisons require appropriate angular tolerance.

---

# 251. Coordinate Tolerance

Geometry equality requires coordinate tolerance.

---

# 252. Bond Order

Bond order must be interpreted chemically rather than merely numerically when performing valence calculations.

---

# 253. Formal Charge and Valence

Valence validation must consider formal charge where the active chemical model supports it.

---

# 254. Periodic Table UI

The periodic table should expose:

```text
Symbol
Name
Atomic Number
Atomic Mass
Group
Period
Category
```

and optionally:

```text
Electronegativity
Common Oxidation States
Isotopes
```

---

# 255. Element Selection

Selecting an element should provide:

```text
Element Details
```

before insertion where practical.

---

# 256. Element Palette

Frequently used elements may be available as shortcuts:

```text
H
C
N
O
F
P
S
Cl
Br
I
```

This is a UI optimization only.

---

# 257. Chemical Data Immutability

Reference data:

```text
Element
Isotope
Periodic Table
```

must be immutable at runtime.

---

# 258. User Customization

Users may customize:

```text
Atom Colors
Rendering Radius
Labels
Display Mode
```

without modifying chemical reference data.

---

# 259. Rendering Preferences

Rendering preferences must be stored separately from molecular structure.

---

# 260. Final Chemistry Principle

The central invariant of AtomSynthesizer is:

```text
                 ┌───────────────────────┐
                 │   CHEMICAL DOMAIN     │
                 │                       │
                 │ Element               │
                 │ Atom                  │
                 │ Bond                  │
                 │ Molecule              │
                 │ Reaction              │
                 │ Validation            │
                 └───────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
          Renderer       Chemistry       Persistence
              │           Engines             │
              ▼              ▼                ▼
          Three.js      RDKit/etc.        PostgreSQL
```

The chemical domain remains the authoritative representation.

The renderer visualizes it.

Chemistry engines analyze it.

Persistence stores it.

AI proposes changes to it.

No external subsystem is allowed to silently redefine it.

---

# 261. Final Rule

If a future feature requires choosing between:

```text
Visual Convenience
```

and:

```text
Chemical Correctness
```

the implementation must preserve chemical correctness.

If the chemistry is uncertain, the application should explicitly say:

```text
Unknown
Unsupported
Approximate
Predicted
Hypothetical
```

rather than inventing certainty.

That principle applies to every future feature of AtomSynthesizer.
