import { Bone, BoxGeometry, Skeleton, SkinnedMesh, Vector3, Uint16BufferAttribute, Float32BufferAttribute, SkeletonHelper } from "three"
import { pageAtom, pages } from "./UI"
import { useEffect, useMemo, useRef, useState } from "react"
import { Color, MathUtils, MeshStandardMaterial, SRGBColorSpace } from "three/src/Three.js"
import { useCursor, useHelper, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { degToRad } from "three/src/math/MathUtils.js"
import { useAtom } from "jotai"
import { easing } from "maath"

const easingFactor = 0.6;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.88;
const PAGE_HEIGHT = 1.32;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS 

// create the single page geometry rather than having instances for each page
const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2)

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0); // move the geometry to the right so the left edge is at 0

const position = pageGeometry.attributes.position // get the position attribute of the pageGeometry
const vertex = new Vector3() // create a new vector3 to store the vertex position
const skinIndexes = [] 
const skinWeights = []

/**
 * Loop through all the vertices of the pageGeometry
 * For each vertex get the x position
 * Calculate the skin index based on the x position (skin index is the bone index which is the bone that the vertex is attached to)
 * Calculate the skin weight based on the x position (skin weight is the weight of the bone to the vertex)
 * Push the skin index and skin weight to the skinIndexes and skinWeights arrays 
 */
for (let i = 0; i < position.count; i++) {
    // ALL VERTICES 
    vertex.fromBufferAttribute(position, i) // get the vertex position
    const x = vertex.x // get the x position of the vertex

    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)) // get the skin index based on the x position. so it grabs the correct bone
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH // get the skin weight based on the x position. so it implements the weight of the bone to the vertex (0-1)

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0) // push the skin index to the skinIndexes array
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0) // push the skin weight to the skinWeights array. 
}

// set the skinIndex and skinWeight attributes to the pageGeometry
pageGeometry.setAttribute(
    'skinIndex',
    new Uint16BufferAttribute(skinIndexes, 4)
)
pageGeometry.setAttribute(
    'skinWeight',
    new Float32BufferAttribute(skinWeights, 4)
)

const whiteColor = new Color('white')
const emmisiveColor = new Color('#f74a4a')

const pageMaterials = [
    
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: "pink",
    }),
    new MeshStandardMaterial({
        color: "blue",
    }),
]

// Loader for the textures of the pages
pages.forEach((page) => {
    useTexture.preload(`/textures/${page.front}`)
    useTexture.preload(`/textures/${page.back}`)
    useTexture.preload(`/textures/sj-rough-new.jpg`)
})

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
    const [picture, picture2, pictureRoughness] = useTexture([
        `/textures/${front}`,
        `/textures/${back}`,
        ...(number === 0 || number === pages.length -1 ? [`/textures/sj-rough-new.jpg`] : [])
    ])
    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

    const group = useRef()
    const turnedAt = useRef(0)
    const lastOpened = useRef(opened)

    const skinnedMeshRef = useRef()

    /**
     * For each page and page segment we create a bone and add it to the previous bone
     * Starting with the first bone at the left edge of the page
     * The bones are added to the mesh and the skeleton is bound to the mesh
     * new skeleton is created with the bones and the mesh is created with the skeleton
     * Then we will create the materials for the pages. 
     * For the cover and back cover we will use the roughness map
     * For the other pages we will use the roughness value of 0.2 to give a bit of roughness to the pages 
     * Then we create the mesh with the geometry and the materials added to it
     * 
     */
    const manualSkinnedMesh = useMemo(() => {
        const bones = []
        for (let i = 0; i <= PAGE_SEGMENTS; i++) {
            let bone = new Bone()
            bones.push(bone)
            if (i === 0) {
                bone.position.x = 0;
            } else {
                bone.position.x = SEGMENT_WIDTH // following bones are moved to the right
            }
            if (i > 0) {
                bones[i - 1].add(bone) // add the bone to the previous bone
            }
        }
        const skeleton = new Skeleton(bones)

        const materials = [...pageMaterials, 
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture,
                ...(number == 0  // if the page is the cover then special roughness map
                    ? {
                        roughnessMap: pictureRoughness,
                    }
                    : {
                        roughness: 0.2,
                    }
                ),
                emissive: emmisiveColor,
                emissiveIntensity: 0, 
            }),
            new MeshStandardMaterial({
                color: whiteColor, 
                map: picture2,
                ...(number == pages.length - 1 // if the page is the back cover then special roughness map
                    ? {
                        roughnessMap: pictureRoughness,
                    }
                    : {
                        roughness: 0.2,
                    }
                ),
                emissive: emmisiveColor,
                emissiveIntensity: 0, 
            })
        ];
        const mesh = new SkinnedMesh(pageGeometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false; // prevent the mesh from being culled
        mesh.add(skeleton.bones[0]); // add the first bone to the mesh
        mesh.bind(skeleton); // bind the skeleton to the mesh
        return mesh 
    }, [])

    // useHelper(skinnedMeshRef, SkeletonHelper, 'cyan')

    /**
     * This will be the animation for the page
     * If the skinnedMeshRef is not null then we will animate the page
     */
    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) {
            return;
        }

        const emissiveIntensity = highlighted ? 0.02 : 0;
        skinnedMeshRef.current.material[4].emissiveIntensity = skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
            skinnedMeshRef.current.material[4].emissiveIntensity,
            emissiveIntensity,
            0.07
        )

        /**
         * If the last opened page is not the current opened page then set the turnedAt to the current date
         * and set the lastOpened to the current opened page
         */
        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date(); 
            lastOpened.current = opened;
        }
        let turningTime = Math.min(400, new Date() - turnedAt.current) / 400; // calculate the turning time based on the current date and the turnedAt date
        turningTime = Math.sin(turningTime * Math.PI); // apply the sin easing to the turning time 

        let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2; // if the book is opened then rotate the page to -90 degrees else 90 degrees
        if (!bookClosed) {
            targetRotation += degToRad(number * 0.8); // rotate the page based on the number of the page
        }

        const bones = skinnedMeshRef.current.skeleton.bones;
        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];

            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.32 + 0.09) : 0;
            const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length) * turningTime)
            let rotationAngle = 
                insideCurveStrength * insideCurveIntensity * targetRotation -
                outsideCurveStrength * outsideCurveIntensity * targetRotation +
                turningCurveStrength * turningIntensity * targetRotation;
                let foldRotationAngle = degToRad(Math.sin(targetRotation) * 2)
            if (bookClosed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                }
            }
            easing.dampAngle(
                target.rotation,
                "y",
                rotationAngle,
                easingFactor,
                delta
            )

            const foldIntensity = 
                i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) -0.5) * turningTime : 0;
                easing.dampAngle(
                    target.rotation,
                    "x",
                    foldRotationAngle * foldIntensity,
                    easingFactorFold,
                    delta
                )
        }
    })

    const [_, setPage] = useAtom(pageAtom) // this is getting the setPage function from the pageAtom
    const [highlighted, setHighlighted] = useState(false)
    useCursor(highlighted)

    return (
        <group {...props} ref={group}
            onPointerEnter={(e) => {
                e.stopPropagation();
                setHighlighted(true);
            }}
            onPointerLeave={(e) => {
                e.stopPropagation();
                setHighlighted(false);
            }}
            onClick={(e) => {
                e.stopPropagation();
                setPage(opened ? number : number + 1);
                setHighlighted(false);
            }}
        >
            <primitive 
                object={manualSkinnedMesh} 
                ref={skinnedMeshRef} 
                position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH} // move the page based on the number of the page
            />
        </group>
    )
}

// Screen breakpoints
// First, let's expand the breakpoint configurations
const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  }
  
  // Expanded configuration object for all responsive values
  const RESPONSIVE_VALUES = {
    mobile: {
      scale: 0.5,
      scaleWhenClosed: 0.77, // 0.8 * 1.2
      positions: {
        closed: {
          x: -0.72,
          y: -0.20
        },
        open: {
          x: 0,
          y: -0.3
        },
        backCover: {
          x: 1.0,
          y: -0.26
        }
      },
      rotation: {
        x: 0.25,
        y: -Math.PI / 2.0
      }
    },
    tablet: {
      scale: 1.2,
      scaleWhenClosed: 1.44, // 1.2 * 1.2
      positions: {
        closed: {
          x: -1.3,
          y: -0.23
        },
        open: {
          x: 0,
          y: -0.35
        },
        backCover: {
          x: 1.3,
          y: -0.31
        }
      },
      rotation: {
        x: 0.28,
        y: -Math.PI / 2.0
      }
    },
    desktop: {
      scale: 1.5,
      scaleWhenClosed: 1.8, // 1.5 * 1.2
      positions: {
        closed: {
          x: -1.6,
          y: -0.27
        },
        open: {
          x: 0,
          y: -0.4
        },
        backCover: {
          x: 1.6,
          y: -0.36
        }
      },
      rotation: {
        x: 0.30,
        y: -Math.PI / 2.0
      }
    }
  }
  
  // Custom hook to handle screen size detection
  const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0
    })
  
    useEffect(() => {
      const handleResize = () => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
  
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])
  
    const getDeviceType = () => {
      if (screenSize.width <= BREAKPOINTS.mobile) return 'mobile'
      if (screenSize.width <= BREAKPOINTS.tablet) return 'tablet'
      return 'desktop'
    }
  
    return {
      screenSize,
      deviceType: getDeviceType()
    }
  }



  export const Book = ({...props}) => {
    const [page] = useAtom(pageAtom)
    const [delayedPage, setDelayedPage] = useState(page)
    const book = useRef()
    const { deviceType } = useScreenSize()

    // Get the current responsive values based on device type
    const currentValues = RESPONSIVE_VALUES[deviceType]

    useEffect(() => {
        let timeout;
        const goToPage = () => {
            setDelayedPage((delayedPage) => {
                if (page === delayedPage) {
                    return delayedPage;
                } else {
                    timeout = setTimeout(() => {
                        goToPage();
                    }, Math.abs(page - delayedPage) > 2 ? 50 : 150)
                }
                if (page > delayedPage) {
                    return delayedPage + 1;
                }
                if (page < delayedPage) {
                    return delayedPage - 1;
                }
            })
        }
        goToPage();
        return () => clearTimeout(timeout);
    }, [page])

    useFrame((_, delta) => {
        const isBookClosed = page === 0
        const isBookClosedBack = page === pages.length

        // Get target position based on book state
        let targetX, targetY;
        let targetScale;

        if (isBookClosed) {
            targetX = currentValues.positions.closed.x;
            targetY = currentValues.positions.closed.y;
            targetScale = currentValues.scaleWhenClosed;
        } else if (isBookClosedBack) {
            targetX = currentValues.positions.backCover.x;
            targetY = currentValues.positions.backCover.y;
            targetScale = currentValues.scale;
        } else {
            targetX = currentValues.positions.open.x;
            targetY = currentValues.positions.open.y;
            targetScale = currentValues.scale;
        }

        // Apply position lerping
        book.current.position.x = MathUtils.lerp(
            book.current.position.x,
            targetX,
            0.03
        )
        book.current.position.y = MathUtils.lerp(
            book.current.position.y,
            targetY,
            0.03
        )

        // Apply scale lerping
        book.current.scale.x = MathUtils.lerp(book.current.scale.x, targetScale, 0.02)
        book.current.scale.y = MathUtils.lerp(book.current.scale.y, targetScale, 0.02)
        book.current.scale.z = MathUtils.lerp(book.current.scale.z, targetScale, 0.02)
    })

    return (
        <group 
            ref={book} 
            {...props} 
            rotation-y={currentValues.rotation.y} 
            rotation-x={currentValues.rotation.x}
        >
            {[...pages].map((pageData, index) => (
                <Page 
                    opened={delayedPage > index}
                    key={index} 
                    page={delayedPage}
                    number={index} 
                    bookClosed={delayedPage === 0 || delayedPage === pages.length} 
                    {...pageData} 
                />
            ))}
        </group>
    )
}