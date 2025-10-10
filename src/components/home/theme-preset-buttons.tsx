"use client";

import {
  AnimationOptions,
  AnimationPlaybackControls,
  motion,
  TargetAndTransition,
  useAnimate,
} from "motion/react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeEditorState } from "@/types/editor";
import { colorFormatter } from "@/utils/color-converter";
import { getPresetThemeStyles } from "@/utils/theme-preset-helper";

// ColorBox component remains internal to ThemePresetButtons
const ColorBox = ({ color }: { color: string }) => {
  return <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: color }} />;
};

interface ThemePresetButtonsProps {
  presetNames: string[];
  mode: "light" | "dark";
  themeState: ThemeEditorState;
  applyThemePreset: (presetName: string) => void;
}

export function ThemePresetButtons({
  presetNames,
  mode,
  themeState,
  applyThemePreset,
}: ThemePresetButtonsProps) {
  // Use the intended slice of presets
  const presetsToShow = presetNames || [];
  const numUniquePresets = presetsToShow.length;

  // Avoid rendering if no presets
  if (numUniquePresets === 0) {
    return null;
  }

  // --- Configuration ---
  const numRows = 3;
  const buttonWidthPx = 160; // Keep consistent with previous style
  const gapPx = 16; // space-x-4 -> 1rem = 16px
  const rowGapPx = 16; // gap-y-4 -> 1rem = 16px
  const duplicationFactor = 4; // Duplicate multiple times for wider screens
  const baseDurationPerItem = 5; // Seconds per item for animation speed
  // ---------------------

  // Distribute presets somewhat evenly across rows
  const presetsByRow: string[][] = Array.from({ length: numRows }, () => []);
  presetsToShow.forEach((preset, index) => {
    presetsByRow[index % numRows].push(preset);
  });

  // Function to create props for a single row
  const createRowProps = (rowIndex: number) => {
    const rowPresets = presetsByRow[rowIndex];
    const numPresetsInRow = rowPresets.length;
    if (numPresetsInRow === 0) return null;

    const duplicatedRowPresets = Array(duplicationFactor).fill(rowPresets).flat();
    const totalWidth = numPresetsInRow * (buttonWidthPx + gapPx);
    const duration = numPresetsInRow * baseDurationPerItem;

    const initialOffset = 0;

    return {
      key: `row-${rowIndex}`,
      presets: duplicatedRowPresets,
      numOriginalPresets: numPresetsInRow,
      animate: { x: [initialOffset, initialOffset - totalWidth] }, // Animate based on original set width, starting from offset
      transition: {
        duration,
        ease: "linear" as const,
        repeat: Infinity,
      },
      style: { x: initialOffset }, // Apply initial offset
    };
  };

  const rowsData = Array.from({ length: numRows }, (_, i) => createRowProps(i)).filter(
    Boolean,
  );

  return (
    // Container for the rows with vertical gap
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="-my-2 mb-8 flex w-full flex-col overflow-hidden py-2"
      style={{
        gap: `${rowGapPx}px`,
        maskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", // Added mask for fading edges
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", // Added for Safari compatibility
      }}
    >
      {rowsData.map((rowData) => (
        <AnimatedRow
          key={rowData!.key}
          target={rowData!.animate}
          options={rowData!.transition}
        >
          {/* Inner div necessary for spacing when using justify-content */}
          <div className="flex flex-shrink-0" style={{ gap: `${gapPx}px` }}>
            {rowData!.presets.map((presetName, index) => {
              const themeStyles = getPresetThemeStyles(presetName)[mode];
              const bgColor = colorFormatter(themeStyles.primary, "hsl", "4");
              const isSelected = presetName === themeState.preset;

              return (
                // Wrapper for each button
                <motion.div
                  key={`${presetName}-${rowData!.key}-${index}`} // More unique key
                  className="min-w-[160px] flex-shrink-0" // Fixed width
                  whileHover={{ scale: 1.02, y: -3, zIndex: 20 }} // Pop on hover
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Button
                    className={cn(
                      "bg-primary/10 relative flex h-full w-full items-center justify-center transition-colors duration-200",
                      "px-4 py-3 hover:shadow-lg",
                      isSelected ? "ring-primary/50 shadow-md ring-2" : "",
                    )}
                    variant="ghost"
                    style={{
                      backgroundColor: bgColor
                        .replace("hsl", "hsla")
                        .replace(/\s+/g, ", ")
                        .replace(")", ", 0.10)"),
                      color: themeStyles.foreground,
                    }}
                    onClick={() => applyThemePreset(presetName)}
                  >
                    <div className="flex items-center gap-2.5 text-center">
                      <div className="flex gap-1">
                        <ColorBox color={themeStyles.primary} />
                        <ColorBox color={themeStyles.secondary} />
                        <ColorBox color={themeStyles.accent} />
                      </div>
                      <span className="px-1 leading-tight capitalize">
                        {presetName.replace(/-/g, " ")}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </AnimatedRow>
      ))}
    </motion.div>
  );
}

interface AnimatedRowProps {
  children: React.ReactNode;
  target: TargetAndTransition;
  options: AnimationOptions;
}

function AnimatedRow({ children, target, options }: AnimatedRowProps) {
  const [scope, animate] = useAnimate();
  const controls = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    controls.current = animate(scope.current, target, options);
  }, [target, options, animate, scope]);

  return (
    <motion.div
      ref={scope}
      className="flex"
      onHoverStart={() => controls.current?.pause()}
      onHoverEnd={() => controls.current?.play()}
    >
      {children}
    </motion.div>
  );
}
