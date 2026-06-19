"use client";

import type { ReactNode } from "react";
import type { Blog } from "@/server/db/schemas/blog.schema";
import type { Product } from "@/server/db/schemas/product.schema";
import type { Service, ServiceType } from "@/server/db/schemas/service.schema";
import type { Project } from "@/server/db/schemas/project.schema";
import type { ApiProduct } from "@/server/db/schemas/api.schema";

import PubHomeHero from "./PubHomeHero";
import PubHomeFeatures from "./PubHomeFeatures";
import PubHomeTechStack from "./PubHomeTechStack";
import PubHomeServices from "./PubHomeServices";
import PubHomeTools from "./PubHomeTools";
import PubHomeApiDocs from "./PubHomeApiDocs";
import PubHomeProducts from "./PubHomeProducts";
import PubHomeProjects from "./PubHomeProjects";
import PubHomeBlogs from "./PubHomeBlogs";
import PubHomeCollaboration from "./PubHomeCollaboration";

interface PubHomeProps {
  initialProjects?: (Project & { service: Service | null })[];
  initialProducts?: Product[];
  initialServices?: (Service & { serviceType: ServiceType | null })[];
  initialBlogs?: Blog[];
  initialApiProducts?: ApiProduct[];
}

const StripeDivider = () => (
  <div
    className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
    style={{ height: "36px" }}
  >
    <div
      className="absolute inset-y-0 left-[-100vw] w-[300vw]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
      }}
    />
  </div>
);

const SectionContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="border-l border-r border-dashed border-primary/20 bg-card/10 p-6">
      {children}
    </div>
  </div>
);

export default function PubHome({
  initialProjects = [],
  initialProducts = [],
  initialServices = [],
  initialBlogs = [],
  initialApiProducts = [],
}: PubHomeProps) {
  return (
    <div className="flex flex-col w-full flex-1">
      {/* 1. Header Hero Area */}
      <PubHomeHero />

      <StripeDivider />

      {/* Core Features / Strengths Section */}
      <SectionContainer>
        <PubHomeFeatures />
      </SectionContainer>

      <StripeDivider />

      {/* Tech Stack Section */}
      <SectionContainer>
        <PubHomeTechStack />
      </SectionContainer>

      <StripeDivider />

      {/* Services Section */}
      {initialServices.length > 0 && (
        <>
          <SectionContainer>
            <PubHomeServices initialServices={initialServices} />
          </SectionContainer>
          <StripeDivider />
        </>
      )}

      {/* Utilities & Tools Grid Section */}
      <SectionContainer>
        <PubHomeTools />
      </SectionContainer>

      <StripeDivider />

      {/* API Docs Section */}
      {initialApiProducts.length > 0 && (
        <>
          <SectionContainer>
            <PubHomeApiDocs initialApiProducts={initialApiProducts} />
          </SectionContainer>
          <StripeDivider />
        </>
      )}

      {/* Products Section */}
      {initialProducts.length > 0 && (
        <>
          <SectionContainer>
            <PubHomeProducts initialProducts={initialProducts} />
          </SectionContainer>
          <StripeDivider />
        </>
      )}

      {/* Projects Section */}
      {initialProjects.length > 0 && (
        <>
          <SectionContainer>
            <PubHomeProjects initialProjects={initialProjects} />
          </SectionContainer>
          <StripeDivider />
        </>
      )}

      {/* Latest Blogs Section */}
      {initialBlogs.length > 0 && (
        <>
          <SectionContainer>
            <PubHomeBlogs initialBlogs={initialBlogs} />
          </SectionContainer>
          <StripeDivider />
        </>
      )}

      {/* Minimal Collaboration Section */}
      <SectionContainer>
        <PubHomeCollaboration />
      </SectionContainer>
    </div>
  );
}
