import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="from-primary to-primary/80 text-primary-foreground relative isolate w-full overflow-hidden bg-gradient-to-br py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(from_var(--primary-foreground)_r_g_b_/_0.075)_1px,transparent_1px),linear-gradient(to_bottom,rgba(from_var(--primary-foreground)_r_g_b_/_0.075)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="bg-foreground/15 absolute -top-24 -left-24 h-64 w-64 animate-pulse rounded-full blur-3xl"></div>
      <div
        className="bg-foreground/15 absolute -right-24 -bottom-24 h-64 w-64 animate-pulse rounded-full blur-3xl"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="relative container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-6 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            Ready to Make Your Components Stand Out?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-foreground/80 mx-auto max-w-[700px] md:text-xl"
          >
            Start customizing your shadcn/ui components today and create a unique look for
            your application.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/editor/theme/">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 cursor-pointer rounded-full px-8 text-base shadow-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
              >
                Try It Now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="https://github.com/jnsahaj/tweakcn">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full bg-transparent px-8 text-base transition-all duration-300 hover:translate-y-[-2px]"
              >
                View on GitHub
              </Button>
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-primary-foreground/80 mt-4 text-sm"
          >
            No login required. Free to use. Open source.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
