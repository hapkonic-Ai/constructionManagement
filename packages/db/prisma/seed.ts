import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
type RoleCode = 'SA' | 'CEO' | 'CTO' | 'CDO' | 'COO' | 'CMO' | 'CFO';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(offset: number): Date {
  return new Date(Date.now() + offset * DAY_MS);
}

async function main() {
  console.log('--- Seeding Platform Infrastructure ---');

  const features = [
    { name: 'Dashboard Access', code: 'DASHBOARD' },
    { name: 'Admin Control Center', code: 'ADMIN_PANEL' },
    { name: 'Project Creation', code: 'PROJECT_CREATE' },
    { name: 'Design Management', code: 'DESIGN_MANAGE' },
    { name: 'Financial Overview', code: 'FINANCE_VIEW' },
    { name: 'Materials Control', code: 'MATERIALS_MANAGE' },
    { name: 'Progress Updates', code: 'PROGRESS_UPDATE' },
    { name: 'Deviation Control', code: 'DEVIATION_MANAGE' },
  ];

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: {},
      create: feature,
    });
  }
  console.log(`- Seeded ${features.length} features.`);

  const defaultPassword = await bcrypt.hash('hapkoniv123', 10);
  const seededUsers = [
    { email: 'admin@hapkoniv.com', name: 'Super Admin', role: 'SA' as RoleCode },
    { email: 'ceo@hapkoniv.com', name: 'Chief Executive Officer', role: 'CEO' as RoleCode },
    { email: 'cto@hapkoniv.com', name: 'Chief Technology Officer', role: 'CTO' as RoleCode },
    { email: 'cdo@hapkoniv.com', name: 'Chief Design Officer', role: 'CDO' as RoleCode },
    { email: 'coo@hapkoniv.com', name: 'Chief Operations Officer', role: 'COO' as RoleCode },
    { email: 'cmo@hapkoniv.com', name: 'Chief Materials Officer', role: 'CMO' as RoleCode },
    { email: 'cfo@hapkoniv.com', name: 'Chief Finance Officer', role: 'CFO' as RoleCode },
  ] as const;

  const usersByRole = new Map<RoleCode, { id: string; email: string; name: string }>();
  for (const userInput of seededUsers) {
    const user = await prisma.user.upsert({
      where: { email: userInput.email },
      update: { role: userInput.role, name: userInput.name },
      create: {
        email: userInput.email,
        name: userInput.name,
        password: defaultPassword,
        role: userInput.role,
      },
      select: { id: true, email: true, name: true },
    });
    usersByRole.set(userInput.role, user);
  }
  console.log(`- Seeded ${seededUsers.length} role users.`);

  const allFeatures = await prisma.feature.findMany();
  const roleFeatureAccess: Record<RoleCode, string[]> = {
    SA: allFeatures.map((f) => f.code),
    CEO: ['DASHBOARD', 'ADMIN_PANEL', 'PROJECT_CREATE', 'FINANCE_VIEW', 'DEVIATION_MANAGE'],
    CTO: ['DASHBOARD', 'DESIGN_MANAGE'],
    CDO: ['DASHBOARD', 'DESIGN_MANAGE'],
    COO: ['DASHBOARD', 'PROGRESS_UPDATE', 'DEVIATION_MANAGE'],
    CMO: ['DASHBOARD', 'MATERIALS_MANAGE', 'FINANCE_VIEW'],
    CFO: ['DASHBOARD', 'FINANCE_VIEW', 'DEVIATION_MANAGE'],
  };

  for (const role of Object.keys(roleFeatureAccess) as RoleCode[]) {
    for (const feature of allFeatures) {
      const enabled = roleFeatureAccess[role].includes(feature.code);
      await prisma.roleFeature.upsert({
        where: {
          roleCode_featureCode: {
            roleCode: role,
            featureCode: feature.code,
          },
        },
        update: { enabled },
        create: {
          roleCode: role,
          featureCode: feature.code,
          enabled,
        },
      });
    }
  }
  console.log('- Seeded role feature matrix.');

  const ceo = usersByRole.get('CEO')!;
  const cto = usersByRole.get('CTO')!;
  const cdo = usersByRole.get('CDO')!;
  const coo = usersByRole.get('COO')!;
  const cmo = usersByRole.get('CMO')!;
  const cfo = usersByRole.get('CFO')!;

  const projectSeeds = [
    {
      title: 'Skyline Residences Phase 2',
      location: 'Mumbai, Maharashtra',
      description: 'Residential high-rise expansion with integrated smart utilities.',
      status: 'ACTIVE',
      budgets: [
        { allocated: 4_500_000, spent: 2_100_000 },
        { allocated: 1_200_000, spent: 460_000 },
      ],
      materials: [
        { name: 'Reinforced Steel', quantity: 130, unitCost: 720 },
        { name: 'Ready Mix Concrete', quantity: 800, unitCost: 98 },
      ],
      labourCosts: [
        { category: 'Civil Engineering', estimatedCost: 880_000 },
        { category: 'Site Safety', estimatedCost: 220_000 },
      ],
      ganttTasks: [
        { title: 'Foundation reinforcement', startOffset: -32, endOffset: 12, progress: 92 },
        { title: 'Core structural framing', startOffset: -10, endOffset: 60, progress: 47 },
        { title: 'Electrical conduits', startOffset: 10, endOffset: 85, progress: 18 },
      ],
      progressNotes: [
        'Completed slab reinforcement for tower block B with QA sign-off.',
        'Started vertical transport shaft work and received all permits.',
      ],
      deviations: [
        { type: 'TIMELINE', delta: 3, reason: 'Weather-driven concrete curing delay', approvedAt: null },
      ],
      designs: [
        { title: 'Tower block B structural revision', order: 1, status: 'RELEASED', estimatedDays: 21 },
        { title: 'Fire evacuation zoning blueprint', order: 2, status: 'READY', estimatedDays: 14 },
      ],
    },
    {
      title: 'GreenGrid Industrial Park',
      location: 'Pune, Maharashtra',
      description: 'Energy-efficient industrial cluster and logistics bay infrastructure.',
      status: 'ACTIVE',
      budgets: [
        { allocated: 8_000_000, spent: 5_700_000 },
        { allocated: 2_600_000, spent: 1_640_000 },
      ],
      materials: [
        { name: 'Solar-ready Roofing Sheets', quantity: 340, unitCost: 180 },
        { name: 'Precast Wall Panels', quantity: 260, unitCost: 250 },
      ],
      labourCosts: [
        { category: 'Industrial MEP Team', estimatedCost: 1_260_000 },
        { category: 'Quality Assurance', estimatedCost: 340_000 },
      ],
      ganttTasks: [
        { title: 'Bay A civil completion', startOffset: -60, endOffset: -10, progress: 100 },
        { title: 'HVAC and utility corridor', startOffset: -12, endOffset: 55, progress: 52 },
        { title: 'Solar tie-in commissioning', startOffset: 40, endOffset: 110, progress: 6 },
      ],
      progressNotes: [
        'Finalized utility corridor trenching and started duct routing.',
        'Bay A handover package submitted for compliance review.',
      ],
      deviations: [
        { type: 'COST', delta: 118_000, reason: 'Imported control panel price surge', approvedAt: daysFromNow(-6) },
      ],
      designs: [
        { title: 'HVAC corridor optimization package', order: 1, status: 'RELEASED', estimatedDays: 16 },
        { title: 'Logistics dock circulation study', order: 2, status: 'DRAFT', estimatedDays: 12 },
      ],
    },
    {
      title: 'Harbor Link Transit Extension',
      location: 'Navi Mumbai, Maharashtra',
      description: 'Transit corridor extension including multimodal terminal integration.',
      status: 'DELAYED',
      budgets: [
        { allocated: 12_000_000, spent: 6_700_000 },
        { allocated: 4_200_000, spent: 1_980_000 },
      ],
      materials: [
        { name: 'Bridge Bearings', quantity: 48, unitCost: 2400 },
        { name: 'Signal Cable Trays', quantity: 180, unitCost: 640 },
      ],
      labourCosts: [
        { category: 'Bridge Fabrication Crew', estimatedCost: 1_850_000 },
        { category: 'Signaling Specialists', estimatedCost: 760_000 },
      ],
      ganttTasks: [
        { title: 'Pile cap completion', startOffset: -42, endOffset: 5, progress: 81 },
        { title: 'Transit terminal shell', startOffset: -8, endOffset: 75, progress: 39 },
        { title: 'Signal integration tests', startOffset: 65, endOffset: 130, progress: 0 },
      ],
      progressNotes: [
        'Pile cap milestones reached on corridor section C with minor variances.',
        'Terminal shell procurement split into two phases to preserve schedule.',
      ],
      deviations: [
        { type: 'TIMELINE', delta: 7, reason: 'Monsoon access constraints on marine side', approvedAt: null },
        { type: 'COST', delta: 210_000, reason: 'Steel joint reinforcement redesign', approvedAt: daysFromNow(-3) },
      ],
      designs: [
        { title: 'Marine side retaining wall revision', order: 1, status: 'READY', estimatedDays: 18 },
        { title: 'Terminal passenger flow rework', order: 2, status: 'DRAFT', estimatedDays: 20 },
      ],
    },
  ];

  const legacyProjects = await prisma.project.findMany({
    where: {
      OR: [{ title: 'Velocity Nexus Demo Project' }, { id: 'demo-project-velocity-nexus' }],
    },
    select: { id: true },
  });

  for (const legacy of legacyProjects) {
    const legacyDesigns = await prisma.design.findMany({
      where: { projectId: legacy.id },
      select: { id: true },
    });

    if (legacyDesigns.length > 0) {
      await prisma.designTimeline.deleteMany({
        where: { designId: { in: legacyDesigns.map((design) => design.id) } },
      });
      await prisma.design.deleteMany({ where: { projectId: legacy.id } });
    }

    await prisma.projectMember.deleteMany({ where: { projectId: legacy.id } });
    await prisma.budgetAllocation.deleteMany({ where: { projectId: legacy.id } });
    await prisma.material.deleteMany({ where: { projectId: legacy.id } });
    await prisma.labourCost.deleteMany({ where: { projectId: legacy.id } });
    await prisma.ganttTask.deleteMany({ where: { projectId: legacy.id } });
    await prisma.progressUpdate.deleteMany({ where: { projectId: legacy.id } });
    await prisma.deviation.deleteMany({ where: { projectId: legacy.id } });
    await prisma.project.delete({ where: { id: legacy.id } });
  }

  for (const input of projectSeeds) {
    const existing = await prisma.project.findFirst({
      where: { title: input.title, ceoId: ceo.id },
      select: { id: true },
    });

    const project = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: {
            location: input.location,
            description: input.description,
            status: input.status,
          },
        })
      : await prisma.project.create({
          data: {
            title: input.title,
            location: input.location,
            description: input.description,
            status: input.status,
            ceoId: ceo.id,
          },
        });

    await prisma.projectMember.deleteMany({ where: { projectId: project.id } });
    await prisma.budgetAllocation.deleteMany({ where: { projectId: project.id } });
    await prisma.material.deleteMany({ where: { projectId: project.id } });
    await prisma.labourCost.deleteMany({ where: { projectId: project.id } });
    await prisma.ganttTask.deleteMany({ where: { projectId: project.id } });
    await prisma.progressUpdate.deleteMany({ where: { projectId: project.id } });
    await prisma.deviation.deleteMany({ where: { projectId: project.id } });

    const existingDesigns = await prisma.design.findMany({
      where: { projectId: project.id },
      select: { id: true },
    });
    if (existingDesigns.length > 0) {
      await prisma.designTimeline.deleteMany({
        where: { designId: { in: existingDesigns.map((design) => design.id) } },
      });
      await prisma.design.deleteMany({ where: { projectId: project.id } });
    }

    await prisma.projectMember.createMany({
      data: [
        { projectId: project.id, userId: cto.id, role: 'CTO' },
        { projectId: project.id, userId: cdo.id, role: 'CDO' },
        { projectId: project.id, userId: coo.id, role: 'COO' },
        { projectId: project.id, userId: cmo.id, role: 'CMO' },
        { projectId: project.id, userId: cfo.id, role: 'CFO' },
      ],
    });

    await prisma.budgetAllocation.createMany({
      data: input.budgets.map((budget) => ({
        projectId: project.id,
        cfOId: cfo.id,
        allocated: budget.allocated,
        spent: budget.spent,
      })),
    });

    await prisma.material.createMany({
      data: input.materials.map((material) => ({
        projectId: project.id,
        cmOId: cmo.id,
        name: material.name,
        quantity: material.quantity,
        unitCost: material.unitCost,
        totalCost: material.quantity * material.unitCost,
      })),
    });

    await prisma.labourCost.createMany({
      data: input.labourCosts.map((cost) => ({
        projectId: project.id,
        cmOId: cmo.id,
        category: cost.category,
        estimatedCost: cost.estimatedCost,
      })),
    });

    await prisma.ganttTask.createMany({
      data: input.ganttTasks.map((task) => ({
        projectId: project.id,
        title: task.title,
        startDate: daysFromNow(task.startOffset),
        endDate: daysFromNow(task.endOffset),
        progress: task.progress,
      })),
    });

    for (const note of input.progressNotes) {
      await prisma.progressUpdate.create({
        data: {
          projectId: project.id,
          cooId: coo.id,
          note,
          attachments: [],
        },
      });
    }

    for (const deviation of input.deviations) {
      await prisma.deviation.create({
        data: {
          projectId: project.id,
          cooId: coo.id,
          type: deviation.type,
          delta: deviation.delta,
          reason: deviation.reason,
          approvedAt: deviation.approvedAt,
        },
      });
    }

    for (const design of input.designs) {
      const created = await prisma.design.create({
        data: {
          projectId: project.id,
          creatorId: design.order % 2 === 0 ? cdo.id : cto.id,
          title: design.title,
          status: design.status,
          order: design.order,
        },
      });

      await prisma.designTimeline.create({
        data: {
          designId: created.id,
          milestones: [`Kickoff: ${design.title}`, 'Review', 'Release'],
          estimatedDays: design.estimatedDays,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: usersByRole.get('SA')!.id,
        action: 'SEED_PROJECT_REFRESH',
        entity: 'PROJECT',
        entityId: project.id,
        metadata: { seededTitle: input.title, seededAt: new Date().toISOString() },
      },
    });
  }

  console.log(`- Seeded ${projectSeeds.length} full portfolio projects with related records.`);
  console.log('--- Seeding Complete ---');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
