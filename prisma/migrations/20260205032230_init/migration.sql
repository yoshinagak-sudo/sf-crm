-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "numberOfEmployees" INTEGER,
    "description" TEXT,
    "billingStreet" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingPostalCode" TEXT,
    "billingCountry" TEXT,
    "shippingStreet" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostalCode" TEXT,
    "shippingCountry" TEXT,
    "accountSource" TEXT,
    "parentId" TEXT,
    "business_type" TEXT,
    "unit" TEXT,
    "land" TEXT,
    "gazette" TEXT,
    "packagingMaterial" TEXT,
    "packing" TEXT,
    "deliveryMethod" TEXT,
    "area" TEXT,
    "packing_case" DOUBLE PRECISION,
    "shop_number" DOUBLE PRECISION,
    "shipping_method" TEXT,
    "account_code" TEXT,
    "rank" TEXT,
    "sales" BOOLEAN NOT NULL DEFAULT false,
    "task" BOOLEAN NOT NULL DEFAULT false,
    "new_existing" TEXT,
    "termination" TEXT,
    "delivery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "accountId" TEXT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT,
    "salutation" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "mobilePhone" TEXT,
    "email" TEXT,
    "title" TEXT,
    "department" TEXT,
    "mailingStreet" TEXT,
    "mailingCity" TEXT,
    "mailingState" TEXT,
    "mailingPostalCode" TEXT,
    "mailingCountry" TEXT,
    "personal_needs" TEXT,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stageName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "nextStep" TEXT,
    "leadSource" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "forecastCategory" TEXT,
    "campaignId" TEXT,
    "product2_id" TEXT,
    "loss_reason" TEXT,
    "opportunity_date" TIMESTAMP(3),
    "process" TEXT,
    "customer_task" TEXT,
    "customer_solution" TEXT,
    "potential_needs" TEXT,
    "budget_situation" TEXT,
    "keyman" TEXT,
    "outcome_note" TEXT,
    "order_reason" TEXT,
    "order_reason_note" TEXT,
    "status" TEXT,
    "accuracy" TEXT,
    "stocks_number" DOUBLE PRECISION,
    "lost_order_reason" TEXT,
    "kg" DOUBLE PRECISION,
    "sales_amount" DOUBLE PRECISION,
    "value_proposition" TEXT,
    "budget" TEXT,
    "authority" TEXT,
    "needs" TEXT,
    "timeframe" TEXT,
    "competitor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "caseNumber" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "subject" TEXT,
    "description" TEXT,
    "type" TEXT,
    "status" TEXT,
    "reason" TEXT,
    "origin" TEXT,
    "priority" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedDate" TIMESTAMP(3),
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "close_limit" TIMESTAMP(3),
    "feeling" TEXT,
    "happening_date" TIMESTAMP(3),
    "factory_name" TEXT,
    "goshitekisya" TEXT,
    "reason_class" TEXT,
    "reason_detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "expectedRevenue" DOUBLE PRECISION,
    "budgetedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT NOT NULL,
    "productCode" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "family" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sf_tasks" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "accountId" TEXT,
    "subject" TEXT,
    "activityDate" TIMESTAMP(3),
    "status" TEXT,
    "priority" TEXT,
    "description" TEXT,
    "companion" TEXT,
    "impressions" TEXT,
    "keyman_flag" BOOLEAN NOT NULL DEFAULT false,
    "presen_flag" BOOLEAN NOT NULL DEFAULT false,
    "project_discovery" BOOLEAN NOT NULL DEFAULT false,
    "spot_flag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sf_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "accountId" TEXT,
    "subject" TEXT,
    "location" TEXT,
    "isAllDayEvent" BOOLEAN NOT NULL DEFAULT false,
    "startDateTime" TIMESTAMP(3),
    "endDateTime" TIMESTAMP(3),
    "description" TEXT,
    "type" TEXT,
    "companion" TEXT,
    "impressions" TEXT,
    "keyman_flag" BOOLEAN NOT NULL DEFAULT false,
    "presen_flag" BOOLEAN NOT NULL DEFAULT false,
    "project_discovery" BOOLEAN NOT NULL DEFAULT false,
    "spot_flag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT,
    "accountId" TEXT,
    "field1" TEXT,
    "field2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_forecastings" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT,
    "center_delivery_date" TIMESTAMP(3),
    "piece_quantity" DOUBLE PRECISION,
    "additional_harvest" DOUBLE PRECISION,
    "stock_addition" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_forecastings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magistrate_masters" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT,
    "accountId" TEXT,
    "unit" TEXT,
    "customer_code" TEXT,
    "delivery_code" TEXT,
    "magistrate_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magistrate_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_masters" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT,
    "accountId" TEXT,
    "product_id" TEXT,
    "product_code" TEXT,
    "unit" TEXT,
    "product_id_code" TEXT,
    "unit_price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_requests" (
    "id" TEXT NOT NULL,
    "sfId" TEXT,
    "name" TEXT,
    "accountId" TEXT,
    "land" TEXT,
    "gazette" TEXT,
    "sterilization_treatment" TEXT,
    "packaging_material" TEXT,
    "packing" TEXT,
    "unit" TEXT,
    "center_delivery_date" TIMESTAMP(3),
    "classification" TEXT,
    "variety_id" TEXT,
    "quantity" DOUBLE PRECISION,
    "cs" DOUBLE PRECISION,
    "note" TEXT,
    "piece_conversion" DOUBLE PRECISION,
    "shipping_method" TEXT,
    "requester" TEXT,
    "packing_case" DOUBLE PRECISION,
    "expected_shipping_date" TIMESTAMP(3),
    "report_id" TEXT,
    "status" TEXT,
    "product_master_id" TEXT,
    "predict_quantity" DOUBLE PRECISION,
    "unit_price" DOUBLE PRECISION,
    "sales_amount" DOUBLE PRECISION,
    "product_name" TEXT,
    "piece_conversion_predict" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_sfId_key" ON "accounts"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_sfId_key" ON "contacts"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_sfId_key" ON "opportunities"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "cases_sfId_key" ON "cases"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "cases_caseNumber_key" ON "cases"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_sfId_key" ON "campaigns"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "products_sfId_key" ON "products"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "sf_tasks_sfId_key" ON "sf_tasks"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "events_sfId_key" ON "events"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_sfId_key" ON "meetings"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_forecastings_sfId_key" ON "inventory_forecastings"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "magistrate_masters_sfId_key" ON "magistrate_masters"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "product_masters_sfId_key" ON "product_masters"("sfId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_requests_sfId_key" ON "shipping_requests"("sfId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_product2_id_fkey" FOREIGN KEY ("product2_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sf_tasks" ADD CONSTRAINT "sf_tasks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magistrate_masters" ADD CONSTRAINT "magistrate_masters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_requests" ADD CONSTRAINT "shipping_requests_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_requests" ADD CONSTRAINT "shipping_requests_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_requests" ADD CONSTRAINT "shipping_requests_product_master_id_fkey" FOREIGN KEY ("product_master_id") REFERENCES "product_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
