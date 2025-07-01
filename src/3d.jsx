import React from 'react';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

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

const StorageScene = React.memo(function StorageScene({ storage, all_storage = [] }) {

    const isStored = (item) =>
        storage.some(s => s.x === item.x && s.y === item.y && s.z === item.z);
    console.log("all:", all_storage);

    return (
        <Canvas style={{ width: '100%', height: '500px' }}>
            <CameraController />
            <pointLight position={[10, 10, 10]} color="white" intensity={1}  />
            <OrbitControls
                makeDefault
                target={[0, 0, 0]}
                enableDamping
            />
            <ambientLight intensity={1.6} />


            {all_storage.map((item, index) => {
                const basePos = [item.x * 1.7, item.y * 1.7, item.z * 1.2];
                const storedHere = isStored(item);

                return (
                    <group key={index}>
                        {/* Flat translucent box on the floor */}
                        <mesh position={[basePos[0], basePos[1], basePos[2] - 0.4]}>
                            <boxGeometry args={[1.5, 1.5, 0.1]} />
                            <meshStandardMaterial
                                color="#ccc"
                                transparent
                                opacity={0.6}
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
        </Canvas>
    );
});

export default StorageScene;

