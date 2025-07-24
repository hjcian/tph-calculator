import React from 'react';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, Text } from '@react-three/drei';

function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(5, -5, 10);
        camera.up.set(0, 0, 1);   // Z axis is up
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera]);

    return null; // this component doesn't render anything itself
}

const StorageScene = React.memo(function StorageScene({ storage, all_storage = [], port = [], robot = [] }) {

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

    const tileSize = 1.5;
    const tileHeight = 0.1;
    const xBarThickness = 0.15;     // stroke width across the bar
    const xBarHeight = 0.05;        // bar thickness in Z
    const diagLenFit = tileSize * Math.SQRT2 - xBarThickness - 0.01; // inset so no overflow

    const axisHighlight = React.useMemo(() => {
        const x0 = Array.from({ length: maxY + 1 }, (_, y) => ({ x: 0, y, z: 0 }));
        const y0 = Array.from({ length: maxX + 1 }, (_, x) => ({ x, y: 0, z: 0 }));
        const map = new Map();
        [...x0, ...y0].forEach(p => map.set(`${p.x},${p.y}`, p)); // dedupe (0,0)
        return [...map.values()];
    }, [maxX, maxY]);

    return (
        <Canvas>
            <CameraController />
            <OrbitControls
                makeDefault
                target={[4, 3, 1]}
                enableDamping
            />
            <ambientLight intensity={1.6} />

            {axisHighlight.map((item, idx) => {
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z * 1.2 - 0.4];

                if (item.x === 0 && item.y === 0) {
                    return (
                        <group key={`axis-origin`} position={basePos}>
                            {/* Red floor (same dims as dark gray) */}
                            <mesh>
                                <boxGeometry args={[tileSize, tileSize, tileHeight]} />
                                <meshStandardMaterial color="red" transparent opacity={0.4} depthWrite={false} />
                            </mesh>

                            {/* Huge X, slightly above the floor to avoid z-fighting */}
                            <mesh position={[0, 0, tileHeight / 2 + 0.01]} rotation={[0, 0, Math.PI / 4]}>
                                <boxGeometry args={[diagLenFit, xBarThickness, xBarHeight]} />
                                <meshStandardMaterial color="black" />
                            </mesh>
                            <mesh position={[0, 0, tileHeight / 2 + 0.01]} rotation={[0, 0, -Math.PI / 4]}>
                                <boxGeometry args={[diagLenFit, xBarThickness, xBarHeight]} />
                                <meshStandardMaterial color="black" />
                            </mesh>
                        </group>
                    );
                }

                return (
                    <mesh key={`axis-${idx}`} position={basePos}>
                        <boxGeometry args={[1.5, 1.5, 0.1]} /> {/* Same as dark gray floor */}
                        <meshStandardMaterial color="cyan" transparent opacity={0.4} depthWrite={false} />
                    </mesh>
                );
            })}

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

            {port.map((item, index) => {
                const maxX = Math.max(...all_storage.map(item => item.x));
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z * 1.2];
                return (
                    <mesh key={`ws-${index}`} position={[basePos[0], basePos[1], basePos[2] + 0.2]}>
                        <boxGeometry args={[1.45, 1.45, 1.2]} />
                        <meshStandardMaterial color="black" />
                        <Edges scale={1.01} color="white" threshold={15} />
                    </mesh>);
            })}

            {port.map((item, index) => {
                const maxX = Math.max(...all_storage.map(item => item.x));
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z* 1.2];
                return (
                    <mesh key={`ws-${index}`} position={[basePos[0], basePos[1], basePos[2] + 0.8]}>
                        <boxGeometry args={[1.5, 1.5, 0.1]} /> {/* Same as dark gray floor */}
                        <meshStandardMaterial color="yellow" transparent opacity={0.4} depthWrite={false} />
                    </mesh>);
            })}

            {robot.length > 0 && robot.map((item, index) => {
                const maxX = Math.max(...all_storage.map(item => item.x));
                const basePos = [(maxX - item.x) * 1.7, item.y * 1.7, item.z != 0 ? (item.z * 1.2) - 0.649 : (item.z * 1.2 - 0.07)];

                return (
                    <mesh key={`robot-${index}`} position={basePos}>
                        <boxGeometry args={[1.2, 1.2, 0.5]} />
                        <meshStandardMaterial color="white" />
                        <Edges scale={1.01} color="black" threshold={15} />
                    </mesh>
                );
            })}

            {Array.from({ length: maxX + 1 }, (_, i) => (
                <Text
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
                    key={`x-label-${i}`}
                    position={[(maxX - i) * 1.7, -1.7, floorOffsetZ]}
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

