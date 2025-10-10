import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Select Theme Preset",
    description: "Choose the theme you want to customize from our growing library.",
  },
  {
    step: "02",
    title: "Customize Visually",
    description:
      "Use our intuitive interface to adjust colors, dimensions, typography, and other properties.",
  },
  {
    step: "03",
    title: "Copy Code",
    description: "Copy the generated Tailwind CSS code directly into your project.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/30 relative isolate w-full overflow-hidden py-20 md:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(from_var(--muted-foreground)_r_g_b_/_0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(from_var(--muted-foreground)_r_g_b_/_0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

      <div className="relative container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col items-center justify-center space-y-4 text-center"
        >
          <Badge
            className="rounded-full px-4 py-1.5 text-sm font-medium shadow-sm"
            variant="secondary"
          >
            <span className="text-primary mr-1">✦</span> How It Works
          </Badge>
          <h2 className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
            Simple Process, Beautiful Results
          </h2>
          <p className="text-muted-foreground max-w-[800px] md:text-lg">
            Customize your shadcn/ui components in just a few simple steps.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center space-y-4 text-center"
            >
              <div className="from-primary to-primary/70 text-primary-foreground relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold shadow-lg">
                {step.step}
                <div
                  className="bg-primary/20 absolute inset-0 animate-ping rounded-full opacity-75"
                  style={{
                    animationDuration: "3s",
                    animationDelay: `${i * 0.5}s`,
                  }}
                ></div>
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
