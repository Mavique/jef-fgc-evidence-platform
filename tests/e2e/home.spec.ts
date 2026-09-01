import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("homepage presents the JEF AI and XR product experience", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Jengrac Education Foundation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore transformation services/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /View platform overview/i })).toBeVisible();
  await expect(page.getByText(/Artificial Intelligence, Extended Reality and Spatial AI systems/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Institutions do not need disconnected tech/i })).toBeVisible();
});

test("hero renders a nonblank 3D spatial canvas", async ({ page }) => {
  await page.goto("/");
  const canvas = page.getByTestId("spatial-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/home-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("old homepage is preserved as the platform overview menu page", async ({ page }) => {
  await page.goto("/platform-overview");
  await expect(page.getByRole("heading", { name: /spatial intelligence for the skills economy/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view dxhub/i })).toBeVisible();
  await expect(page.getByText(/AI \+ XR company/i)).toBeVisible();
  await expect(page.getByText(/Product modules for immersive skills delivery/i)).toBeVisible();
  await expect(page.getByText(/Impact data stays honest until verified/i)).toBeVisible();
});

test("mobile navigation opens and links to contact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /toggle navigation/i }).click();
  await expect(page.locator("#mobile-menu").getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.locator("#mobile-menu").getByRole("link", { name: "JEF Platform" })).toBeVisible();
  await expect(page.locator("#mobile-menu").getByRole("link", { name: "DxHub" })).toBeVisible();
});

test("About page explains JEF identity and evidence posture", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: /technology company with education at the centre/i })).toBeVisible();
  await expect(page.getByText(/Artificial Intelligence, Extended Reality and Spatial AI systems/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not a generic charity page/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Transformation Services/i })).toBeVisible();
  await expect(page.getByText(/Specific impact numbers, funders, live deployments and partner claims require JEF-approved evidence/i)).toBeVisible();
});

test("Services page presents the transformation gateway and sector pathways", async ({ page }) => {
  await page.goto("/services");
  await expect(page.getByRole("heading", { name: /Transform institutions/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Find your transformation pathway/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Technology is only one layer/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose the system you need to transform/i })).toBeVisible();
  await page.getByRole("button", { name: /Healthcare Institutions/i }).click();
  await expect(page.getByRole("heading", { level: 2, name: /HealthDX/i })).toBeVisible();
  await expect(page.getByText(/Do not imply diagnosis/i)).toBeVisible();
  await expect(page).toHaveURL(/#health$/);
});

test("Services page deep-links to a selected sector and accepts a prototype enquiry", async ({ page }) => {
  await page.goto("/services#enterprise");
  await expect(page.getByRole("heading", { level: 2, name: /BizDX/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: /Run smarter\. Serve better/i })).toBeVisible();
  await page.getByLabel("Name").fill("Test Visitor");
  await page.getByLabel("Organisation").fill("Example Institution");
  await page.getByLabel("Role").fill("Operations Lead");
  await page.getByLabel("Work email").fill("visitor@example.com");
  await page.getByLabel(/Challenge summary/i).fill("We need a structured transformation diagnostic.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Submit transformation enquiry/i }).click();
  await expect(page.getByRole("status")).toContainText(/local prototype success state/i);
});

test("DxHub programme page explains the proposed system", async ({ page }) => {
  await page.goto("/programmes/dxhub");
  await expect(page.getByRole("heading", { name: "Digital Transformation Hubs" })).toBeVisible();
  await expect(page.getByText(/Do not portray proposed hubs as operational facts/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Proposed Sedibeng network/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Emfuleni DxHub/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /The transformation loop/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Capability constellation/i })).toBeVisible();
  await expect(page.getByLabel(/Partnership pathway/i)).toBeVisible();
});

test("Prolific Edge page explains the enterprise transformation system", async ({ page }) => {
  await page.goto("/programmes/prolific-edge");
  await expect(page.getByRole("heading", { name: /Prolific Edge/i })).toBeVisible();
  await expect(page.getByText(/No proposal-specific figures or unverified outcomes are displayed/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Enterprise Evolution Journey/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Enterprise Discovery/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Transformation Campus/i })).toBeVisible();
  await expect(page.getByLabel(/Partnership route/i)).toBeVisible();
});

test("WORKGRID LABS page renders the transformation grid experience", async ({ page }) => {
  await page.goto("/programmes/workgrid-labs");
  await expect(page.getByRole("heading", { name: /WORKGRID LABS/i })).toBeVisible();
  await expect(page.getByText(/The TVET-to-Work Transformation Grid/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Build Your Workgrid Path/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose a role/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /I am a student/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /A pathway, not a course queue/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Industry mission simulator/i })).toBeVisible();
});

test("WORKGRID LABS renders a nonblank 3D routing canvas", async ({ page }) => {
  await page.goto("/programmes/workgrid-labs");
  const canvas = page.getByTestId("workgrid-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/workgrid-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("XR Labs for TVET Colleges page explains the living lab capability system", async ({ page }) => {
  await page.goto("/programmes/xr-labs-tvet-colleges");
  await expect(page.getByRole("heading", { name: /XR Labs for TVET Colleges/i })).toBeVisible();
  await expect(page.getByText(/Platform-neutral TVET capability system/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Build the living lab/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not a room containing headsets/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Six layers before scale/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Technology and content systems/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Never collapse evidence/i })).toBeVisible();
});

test("XR Labs for TVET Colleges renders a nonblank 3D living lab canvas", async ({ page }) => {
  await page.goto("/programmes/xr-labs-tvet-colleges");
  const canvas = page.getByTestId("tvet-xr-lab-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/tvet-xr-lab-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");

    let lit = 0;
    if (gl) {
      const sample = new Uint8Array(4);
      gl.finish();

      for (let y = 0.18; y <= 0.86; y += 0.08) {
        for (let x = 0.12; x <= 0.88; x += 0.08) {
          gl.readPixels(
            Math.floor(canvasNode.width * x),
            Math.floor(canvasNode.height * y),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sample
          );
          if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
        }
      }

      return lit;
    }

    const context = canvasNode.getContext("2d");
    if (!context) return 0;
    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        const [r, g, b, a] = context.getImageData(Math.floor(canvasNode.width * x), Math.floor(canvasNode.height * y), 1, 1).data;
        if (r + g + b + a > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("JEF AI Services page explains responsible human-AI work systems", async ({ page }) => {
  await page.goto("/programmes/ai-services");
  await expect(page.getByRole("heading", { name: /JEF AI Services/i })).toBeVisible();
  await expect(page.getByText(/Problem-led AI\. Human oversight visible/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Design an AI-enabled workflow/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not a catalogue of fashionable tools/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Begin with the work, not the model/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Approval-gated agent/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Inspect the answer before you trust it/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /One demo does not establish reliability/i })).toBeVisible();
});

test("JEF AI Services renders a nonblank intelligence workbench canvas", async ({ page }) => {
  await page.goto("/programmes/ai-services");
  const canvas = page.getByTestId("ai-services-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/ai-services-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");

    let lit = 0;
    if (gl) {
      const sample = new Uint8Array(4);
      gl.finish();

      for (let y = 0.18; y <= 0.86; y += 0.08) {
        for (let x = 0.12; x <= 0.88; x += 0.08) {
          gl.readPixels(
            Math.floor(canvasNode.width * x),
            Math.floor(canvasNode.height * y),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sample
          );
          if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
        }
      }

      return lit;
    }

    const context = canvasNode.getContext("2d");
    if (!context) return 0;
    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        const [r, g, b, a] = context.getImageData(Math.floor(canvasNode.width * x), Math.floor(canvasNode.height * y), 1, 1).data;
        if (r + g + b + a > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("VOCLE XR page explains the cognitive learning platform", async ({ page }) => {
  await page.goto("/programmes/vocle-xr");
  await expect(page.getByRole("heading", { name: /VOCLE XR/i })).toBeVisible();
  await expect(page.getByText(/From immersive learning to verified human capability/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Follow the Cognitive Learning Loop/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not an XR content library/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Follow Thabo's first loop/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Learner experience/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /The Twin is revisable/i })).toBeVisible();
});

test("VOCLE XR renders a nonblank 3D cognitive loop canvas", async ({ page }) => {
  await page.goto("/programmes/vocle-xr");
  const canvas = page.getByTestId("vocle-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/vocle-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("XR in Basic Education page explains the BEEI immersive learning pathway", async ({ page }) => {
  await page.goto("/programmes/xr-basic-education");
  await expect(page.getByRole("heading", { name: /XR in Basic Education/i })).toBeVisible();
  await expect(page.getByText(/Basic Education and BEEI architecture/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Transform a curriculum concept/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not a headset distribution project/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /One curriculum concept, transformed carefully/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Education Assistant/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Measure what matters/i })).toBeVisible();
});

test("XR in Basic Education renders a nonblank 3D page-to-presence canvas", async ({ page }) => {
  await page.goto("/programmes/xr-basic-education");
  const canvas = page.getByTestId("xr-basic-education-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/xr-basic-education-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("JEF iCampus page explains the connected learning campus", async ({ page }) => {
  await page.goto("/programmes/icampus");
  await expect(page.getByRole("heading", { name: /JEF iCampus/i })).toBeVisible();
  await expect(page.getByText(/Your connected campus for the intelligent economy/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Find My Learning Path/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Not a course catalogue/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Start with a goal/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Become AI-capable in my work/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Credential Decoder/i })).toBeVisible();
});

test("JEF iCampus renders a nonblank 3D campus canvas", async ({ page }) => {
  await page.goto("/programmes/icampus");
  const canvas = page.getByTestId("icampus-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/icampus-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("WorxStream page explains governed opportunity routing", async ({ page }) => {
  await page.goto("/programmes/worxstream");
  await expect(page.getByRole("heading", { name: /WorxStream/i })).toBeVisible();
  await expect(page.getByText(/Not a jobs board/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore My Opportunity Journey/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /No universal score/i })).toBeVisible();
  await expect(page.getByText(/Passport Consent Preview/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Employment", exact: true })).toBeVisible();
});

test("WorxStream renders a nonblank 3D opportunity canvas", async ({ page }) => {
  await page.goto("/programmes/worxstream");
  const canvas = page.getByTestId("worxstream-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/worxstream-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("Spatial Enterprise page explains contextual workplace intelligence", async ({ page }) => {
  await page.goto("/programmes/spatial-enterprise");
  await expect(page.getByRole("heading", { name: /Spatial Enterprise Solutions/i })).toBeVisible();
  await expect(page.getByText(/Not AR theatre/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore Asset A17/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Follow Asset A17/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Technician view/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Digital Twin Decoder/i })).toBeVisible();
});

test("Spatial Enterprise renders a nonblank 3D Asset A17 canvas", async ({ page }) => {
  await page.goto("/programmes/spatial-enterprise");
  const canvas = page.getByTestId("spatial-enterprise-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/spatial-enterprise-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("Gig-Economy Accelerator page explains protected independent work", async ({ page }) => {
  await page.goto("/programmes/gig-economy-accelerator");
  await expect(page.getByRole("heading", { name: /Gig-Economy Accelerator/i })).toBeVisible();
  await expect(page.getByText(/Do not sell easy online income/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore My Accelerator Journey/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Readiness Compass/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /AI-enabled business support/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Gig Economics Calculator/i })).toBeVisible();
});

test("Gig-Economy Accelerator renders a nonblank 3D resilience canvas", async ({ page }) => {
  await page.goto("/programmes/gig-economy-accelerator");
  const canvas = page.getByTestId("gig-accelerator-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/gig-accelerator-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("Spatial AI City page explains civic spatial intelligence", async ({ page }) => {
  await page.goto("/programmes/spatial-ai-city");
  await expect(page.getByRole("heading", { name: /Spatial AI City/i })).toBeVisible();
  await expect(page.getByText(/Not a surveillance smart city/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the Living District/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /One place, many truths/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Public services/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Data Trust Inspector/i })).toBeVisible();
});

test("Spatial AI City renders a nonblank 3D Living District canvas", async ({ page }) => {
  await page.goto("/programmes/spatial-ai-city");
  const canvas = page.getByTestId("spatial-ai-city-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/spatial-ai-city-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});

test("Workplace 4.0 page explains human-centred work transformation", async ({ page }) => {
  await page.goto("/programmes/workplace-4");
  await expect(page.getByRole("heading", { name: /Workplace 4.0/i })).toBeVisible();
  await expect(page.getByText(/Why work needs redesign/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore a work transformation/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Meet the Smart Worker/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Duplicate capture/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Human-AI work is designed/i })).toBeVisible();
});

test("Workplace 4.0 renders a nonblank 3D work signal canvas", async ({ page }) => {
  await page.goto("/programmes/workplace-4");
  const canvas = page.getByTestId("workplace-canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/workplace-4-3d-hero.png", fullPage: false });

  const litPixels = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    const gl = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl");
    if (!gl) return 0;

    let lit = 0;
    const sample = new Uint8Array(4);
    gl.finish();

    for (let y = 0.18; y <= 0.86; y += 0.08) {
      for (let x = 0.12; x <= 0.88; x += 0.08) {
        gl.readPixels(
          Math.floor(canvasNode.width * x),
          Math.floor(canvasNode.height * y),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sample
        );
        if (sample[0] + sample[1] + sample[2] + sample[3] > 20) lit += 1;
      }
    }

    return lit;
  });

  expect(litPixels).toBeGreaterThan(0);
});
