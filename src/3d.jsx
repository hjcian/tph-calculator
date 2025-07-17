import React from 'react';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, Text } from '@react-three/drei';

function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(10, 10, 10);
        camera.up.set(0, 0, 1);   // Z axis is up
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera]);

    return null; // this component doesn't render anything itself
}

const StorageScene = React.memo(function StorageScene({ storage, all_storage = [], workstation = [] }) {

    const isStored = (item) =>
        storage.some(s => s.x === item.x && s.y === item.y && s.z === item.z);
    console.log("all:", all_storage);
    const floorOffsetZ = -0.35; // slightly above the floor mesh

    // Compute max X and max Y from all_storage for labeling range
    const maxX = Math.max(...all_storage.map(item => item.x));
    const maxY = Math.max(...all_storage.map(item => item.y));

    const uniqueXY = Array.from(
        new Set(all_storage.map(item => `${item.x},${item.y}`))
    ).map(str => {
        const [x, y] = str.split(',').map(Number);
        return { x, y, z: 0 };
    });
    return (
        <Canvas>
            <CameraController />
            <pointLight position={[10, 10, 10]} color="white" intensity={1} />
            <OrbitControls
                makeDefault
                target={[0, 0, 0]}
                enableDamping
            />
            <ambientLight intensity={1.6} />


            {[...uniqueXY, ...all_storage].map((item, index) => {
                const maxX = Math.max(...all_storage.map(item => item.x));
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z * 1.2];
                const storedHere = isStored(item);

                return (
                    <group key={index}>
                        {/* Flat translucent box on the floor */}
                        <mesh position={[basePos[0], basePos[1], basePos[2] - 0.4]}>
                            <boxGeometry args={[1.5, 1.5, 0.1]} />
                            <meshStandardMaterial
                                color={item.z === 0 ? "#888" : "#ccc"}
                                transparent
                                opacity={item.z === 0 ? 1 : 0.6}
                                depthWrite={false}
                            />
                        </mesh>

                        {storedHere && (
                            <mesh position={basePos}>
                                <boxGeometry args={[1, 1, 0.6]} />
                                <meshStandardMaterial color="#ff7438" />
                                <Edges scale={1.01} color="black" threshold={15} />
                            </mesh>
                        )}
                    </group>
                );
            })}
            {workstation.map((item, index) => {
                const maxX = Math.max(...all_storage.map(item => item.x));
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z * 1.2];
                return (
                    <mesh key={`ws-${index}`} position={[basePos[0], basePos[1], basePos[2] + 0.2]}>
                        <boxGeometry args={[1.5, 1.5, 1.2]} />
                        <meshStandardMaterial color="black" />
                        <Edges scale={1.01} color="white" threshold={15} />
                    </mesh>);
            })}

            {Array.from({ length: maxX + 1 }, (_, i) => (
                <Text
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
                    key={`x-label-${i}`}
                    position={[(maxX - i) * 1.7, 0, floorOffsetZ]}
                    rotation={[0, 0, 0]}
                    fontSize={0.4}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                >
                    {i}
                </Text>
            ))}

            {Array.from({ length: maxY + 1 }, (_, i) => (
                <Text
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
                    key={`y-label-${i}`}
                    position={[(maxX + 1) * 1.7, i * 1.7, floorOffsetZ]}
                    rotation={[0, 0, Math.PI / 2]}
                    fontSize={0.4}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                >
                    {i}
                </Text>
            ))}
        </Canvas>
    );
});

export default StorageScene;

