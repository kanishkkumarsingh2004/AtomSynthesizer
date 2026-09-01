'use client';

import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { MoleculeRenderer } from './MoleculeRenderer';
import { SelectionRenderer } from './SelectionRenderer';
import { AtomicQuantumVisualizer } from './AtomicQuantumVisualizer';
import { ReactionSimulationEngine } from '../../chemistry/core/ReactionSimulationEngine';

const SceneContent: React.FC = () => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const setMolecule = useMoleculeStore((state) => state.setMolecule);
  const addAtom = useMoleculeStore((state) => state.addAtom);
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const activeElementNumber = useWorkspaceStore((state) => state.activeElementNumber);
  const showGrid = useWorkspaceStore((state) => state.showGrid);
  const showAxes = useWorkspaceStore((state) => state.showAxes);
  const autoBondingEnabled = useWorkspaceStore((state) => state.autoBondingEnabled);
  const reactionSimulationActive = useWorkspaceStore((state) => state.reactionSimulationActive);
  const livePhysicsEnabled = useWorkspaceStore((state) => state.livePhysicsEnabled);
  const temperatureK = useWorkspaceStore((state) => state.temperatureK);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  // Live real-time physics & vibration frame loop
  useFrame(() => {
    if ((livePhysicsEnabled || reactionSimulationActive) && molecule.atoms.length > 0) {
      const { updatedMolecule } = ReactionSimulationEngine.stepLiveVibratingPhysics(
        molecule,
        temperatureK,
        autoBondingEnabled
      );
      setMolecule(updatedMolecule);
    }
  });

  const handlePointerDownPlane = (e: any) => {
    // Only handle if clicking empty space/plane (not an atom/bond)
    if (e.intersections && e.intersections.length > 0) {
      const topObj = e.intersections[0].object;
      if (topObj.userData && topObj.userData.entityId) {
        return; // Clicked an atom/bond
      }
    }

    if (activeTool === 'add_atom') {
      const point = e.point || { x: 0, y: 0, z: 0 };
      const newPos = {
        x: Math.round(point.x * 10) / 10,
        y: Math.round(point.y * 10) / 10,
        z: Math.round(point.z * 10) / 10
      };
      addAtom(activeElementNumber, newPos);
    } else {
      clearSelection();
    }
  };

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />

      {showGrid && (
        <Grid
          args={[30, 30]}
          cellSize={1}
          cellThickness={1}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#475569"
          fadeDistance={30}
          fadeStrength={1.5}
          infiniteGrid
        />
      )}

      {showAxes && <axesHelper args={[3]} />}

      {/* Background click target plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerDown={handlePointerDownPlane}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      <MoleculeRenderer molecule={molecule} />
      <SelectionRenderer />

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </>
  );
};

export const MolecularCanvas: React.FC = () => {
  return (
    <div className="relative h-full w-full bg-slate-950">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true }}
        className="h-full w-full"
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};
