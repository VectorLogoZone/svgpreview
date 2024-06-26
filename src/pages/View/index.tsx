/* eslint-disable no-console */
import { useRef } from 'react';
import React from 'react';



import {
  Box,
  VStack,
  StackProps,
  Container,
  ContainerProps,
  Flex,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";



import { t } from "utils";
import { setQueryStringParam } from 'utils/querystring';
import { safeParseFloat } from "utils/safeParseFloat";



import { ErrorPageStrategy } from "shared/Result";
import { useNavigate, useSearchParams } from "shared/Router";



import { DesktopToolbar } from "./DesktopToolbar";
import { MobileToolbar } from './MobileToolbar';


const ViewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement>(null); 
  const containerRef = useRef<HTMLDivElement>(null);

  const imageSize = useSize(imageRef);
  const containerSize = useSize(containerRef);

  const url = searchParams.get('url') || undefined;
  const zoom = searchParams.get('zoom') || '1'
  let zoomVal = safeParseFloat(zoom, 1);
  if (zoom === 'max') {
    zoomVal = calcMaxZoom(imageRef, containerRef);
  };
  const zoomCss:Record<string, string> = {};
  if (imageRef.current != null) {
    zoomCss["width"] = `${zoomVal * imageRef.current.naturalWidth}px`;
    zoomCss["height"] = `${zoomVal * imageRef.current.naturalHeight}px`;
  }

  const bg = searchParams.get('bg') || 'memphis-mini';
  const background: Record<string, string> = {};
  if (/^#[0-9A-Fa-f]{6}$/.test(bg)) {
    background["backgroundColor"] = bg;
  } else if (/^[-a-z]+$/.test(bg)) {
    background["backgroundImage"] = `url(/images/backgrounds/${bg}.png)`;
  } else {
    background["backgroundColor"] = '#eeeeee';
  }

  const border = searchParams.get('border') || 'dash';
  const borderCss: Record<string, string> = {};
  const borderColor = bg === '#111111' ? '#ffffff' : '#000000';   // LATER: more robust color selection algorithm
  if (border === "dash") {
    borderCss["outline"] = `1px dashed ${borderColor}`;
  } else if (border === "thin") {
    borderCss["outline"] = `1px solid ${borderColor}`;
  } else if (border === "thick") {
    borderCss["outline"] = `4px solid ${borderColor}`;
  } else {
    borderCss["outline"] = "none";
  }
  const isDebug = (searchParams.get("debug") || "0") === "1";

  const isSmall = window.innerWidth < 768;
  console.log(`isSmall: ${isSmall} ${window.innerWidth}`)

  const toolbar = useBreakpointValue({ base: <MobileToolbar />, lg: <DesktopToolbar /> }) || <DesktopToolbar />;

  return (
    <VStack
      w="100%"
      h="100vh"
      spacing="0"
      style={{ overflow: 'clip'}}
    >
      { toolbar }
      <Flex position={"relative"} ref={containerRef} w="100%" h="100%" bg="white" alignItems="center" justifyContent="center" style={{ overflow: 'clip', ...background }}>
          <img ref={imageRef} src={url} style={{ "overflow":"auto auto", ...zoomCss, ...borderCss }} onLoad={
            () => {
              // eslint-disable-next-line no-console
              console.log(`onload: ${zoom}, ${imageRef.current?.naturalWidth}, ${imageRef.current?.naturalHeight}`)
              if (zoom === 'max') {
                zoomVal = calcMaxZoom(imageRef, containerRef);
              }
              if (imageRef.current) {
                imageRef.current.style.width =
                  `${zoomVal * imageRef.current.naturalWidth}px`;
                imageRef.current.style.height = `${
                  zoomVal * imageRef.current.naturalHeight
                }px`;
              }
            }
          }/>
          {isDebug && <Text position={"absolute"} top={0} left={2}>Image zoomed size: {imageSize.width} x {imageSize.height} </Text>}
          {isDebug && <Text position={"absolute"} bottom={0} left={2}>Image actual size: {imageRef.current?.naturalWidth}x{imageRef.current?.naturalHeight} </Text>}
          {isDebug && <Text position={"absolute"} top={0} right={2}>Container size: {containerSize.width}x{containerSize.height} </Text>}
          {isDebug && <Text position={"absolute"} bottom={0} right={2}>Window size: {window.innerWidth}x{window.innerHeight} </Text>}
      </Flex>
    </VStack>
  );
};

function calcMaxZoom(imageRef: React.RefObject<HTMLImageElement>, containerRef: React.RefObject<HTMLDivElement>) {
  if (imageRef.current != null && containerRef.current != null) {

    // -4 so there is room for the border to be visible
    const maxZoom = Math.min(
      (window.innerWidth - 4) / imageRef.current.naturalWidth,
      (containerRef.current.clientHeight - 4) / imageRef.current.naturalHeight
    );
    return maxZoom;
  }
  return 1;
}


const useSize = (target: React.RefObject<HTMLElement>) => {
  const [size, setSize] = React.useState({width: 0, height: 0});

  React.useLayoutEffect(() => {
    if (target.current == null) {
      return;
    }
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};


export const Component = ViewPage; //withRequireImage(PreviewPage, { to: "/open.html" });

export const ErrorBoundary = ErrorPageStrategy;