import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const dataDir = path.join(__dirname, "../../sf-data");

function readSfData(objectName: string): any[] {
  const filePath = path.join(dataDir, `${objectName}.json`);
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.result?.records || [];
}

function parseDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toFloat(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function toInt(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function toBool(val: any): boolean {
  return val === true || val === "true";
}

// Maps: SF ID -> local ID
const accountMap = new Map<string, string>();
const contactMap = new Map<string, string>();
const campaignMap = new Map<string, string>();
const productMap = new Map<string, string>();
const productMasterMap = new Map<string, string>();

async function importAccounts() {
  const records = readSfData("Account");
  console.log(`Importing ${records.length} accounts...`);

  // First pass: create all accounts without parent references
  for (const r of records) {
    const account = await prisma.account.create({
      data: {
        sfId: r.Id,
        name: r.Name || "Unknown",
        type: r.Type,
        phone: r.Phone,
        fax: r.Fax,
        website: r.Website,
        industry: r.Industry,
        numberOfEmployees: toInt(r.NumberOfEmployees),
        description: r.Description,
        billingStreet: r.BillingStreet,
        billingCity: r.BillingCity,
        billingState: r.BillingState,
        billingPostalCode: r.BillingPostalCode,
        billingCountry: r.BillingCountry,
        shippingStreet: r.ShippingStreet,
        shippingCity: r.ShippingCity,
        shippingState: r.ShippingState,
        shippingPostalCode: r.ShippingPostalCode,
        shippingCountry: r.ShippingCountry,
        accountSource: r.AccountSource,
        businessType: r.BusinessType__c,
        unit: r.Unit__c,
        land: r.Land__c,
        gazette: r.Gazette__c,
        packagingMaterial: r.PackagingMaterial__c,
        packing: r.Packing__c,
        deliveryMethod: r.DeliveryMethod__c,
        area: r.Area__c,
        packingCase: toFloat(r.PackingCase__c),
        shopNumber: toFloat(r.ShopNumber__c),
        shippingMethod: r.ShippingMethod__c,
        accountCode: r.AccountCode__c,
        rank: r.Rank__c,
        sales: toBool(r.Sales__c),
        task: toBool(r.Task__c),
        newExisting: r.new_Existing__c,
        termination: r.Termination__c,
        delivery: Array.isArray(r.delivery__c) ? r.delivery__c.join(";") : r.delivery__c,
      },
    });
    accountMap.set(r.Id, account.id);
  }

  // Second pass: set parent references
  for (const r of records) {
    if (r.ParentId && accountMap.has(r.ParentId)) {
      const localId = accountMap.get(r.Id)!;
      await prisma.account.update({
        where: { id: localId },
        data: { parentId: accountMap.get(r.ParentId) },
      });
    }
  }
  console.log(`  Done: ${accountMap.size} accounts`);
}

async function importContacts() {
  const records = readSfData("Contact");
  console.log(`Importing ${records.length} contacts...`);
  for (const r of records) {
    const contact = await prisma.contact.create({
      data: {
        sfId: r.Id,
        accountId: r.AccountId ? accountMap.get(r.AccountId) : null,
        lastName: r.LastName || "Unknown",
        firstName: r.FirstName,
        salutation: r.Salutation,
        phone: r.Phone,
        fax: r.Fax,
        mobilePhone: r.MobilePhone,
        email: r.Email,
        title: r.Title,
        department: r.Department,
        mailingStreet: r.MailingStreet,
        mailingCity: r.MailingCity,
        mailingState: r.MailingState,
        mailingPostalCode: r.MailingPostalCode,
        mailingCountry: r.MailingCountry,
        personalNeeds: r.Personalneeds__c,
        position: r.Position__c,
      },
    });
    contactMap.set(r.Id, contact.id);
  }
  console.log(`  Done: ${contactMap.size} contacts`);
}

async function importProducts() {
  const records = readSfData("Product2");
  console.log(`Importing ${records.length} products...`);
  for (const r of records) {
    const product = await prisma.product.create({
      data: {
        sfId: r.Id,
        name: r.Name || "Unknown",
        productCode: r.ProductCode,
        description: r.Description,
        isActive: toBool(r.IsActive),
        family: r.Family,
      },
    });
    productMap.set(r.Id, product.id);
  }
  console.log(`  Done: ${productMap.size} products`);
}

async function importCampaigns() {
  const records = readSfData("Campaign");
  console.log(`Importing ${records.length} campaigns...`);
  for (const r of records) {
    const campaign = await prisma.campaign.create({
      data: {
        sfId: r.Id,
        name: r.Name || "Unknown",
        type: r.Type,
        status: r.Status,
        startDate: parseDate(r.StartDate),
        endDate: parseDate(r.EndDate),
        expectedRevenue: toFloat(r.ExpectedRevenue),
        budgetedCost: toFloat(r.BudgetedCost),
        actualCost: toFloat(r.ActualCost),
        description: r.Description,
        isActive: toBool(r.IsActive),
      },
    });
    campaignMap.set(r.Id, campaign.id);
  }
  console.log(`  Done: ${campaignMap.size} campaigns`);
}

async function importOpportunities() {
  const records = readSfData("Opportunity");
  console.log(`Importing ${records.length} opportunities...`);
  for (const r of records) {
    await prisma.opportunity.create({
      data: {
        sfId: r.Id,
        accountId: r.AccountId ? accountMap.get(r.AccountId) : null,
        contactId: r.ContactId ? contactMap.get(r.ContactId) : null,
        name: r.Name || "Unknown",
        description: r.Description,
        stageName: r.StageName || "Unknown",
        amount: toFloat(r.Amount),
        closeDate: parseDate(r.CloseDate) || new Date(),
        type: r.Type,
        nextStep: r.NextStep,
        leadSource: r.LeadSource,
        isClosed: toBool(r.IsClosed),
        isWon: toBool(r.IsWon),
        forecastCategory: r.ForecastCategoryName,
        campaignId: r.CampaignId ? campaignMap.get(r.CampaignId) : null,
        product2Id: r.Product2__c ? productMap.get(r.Product2__c) : null,
        lossReason: r.Loss_Reason__c,
        opportunityDate: parseDate(r.OppotunityDate__c),
        process: r.process__c,
        customerTask: r.CustomerTask__c,
        customerSolution: r.CustomerSolution__c,
        potentialNeeds: r.PotentialNeeds__c,
        budgetSituation: r.BudgetSituation__c,
        keyman: r.Keyman__c,
        outcomeNote: r.OutcomeNote__c,
        orderReason: r.OrderReason__c,
        orderReasonNote: r.OrderReasonNote__c,
        status: r.status__c,
        accuracy: r.Accuracy__c,
        stocksNumber: toFloat(r.StocksNumber__c),
        lostOrderReason: r.LostOrderReason__c,
        kg: toFloat(r.kg__c),
        salesAmount: toFloat(r.Sales__c),
        valueProposition: r.ValueProposition__c,
        budget: r.Budget__c,
        authority: r.Authority__c,
        needs: r.Needs__c,
        timeframe: r.Timeframe__c,
        competitor: r.Competitor__c,
      },
    });
  }
  console.log(`  Done`);
}

async function importCases() {
  const records = readSfData("Case");
  console.log(`Importing ${records.length} cases...`);
  for (const r of records) {
    await prisma.case.create({
      data: {
        sfId: r.Id,
        caseNumber: r.CaseNumber,
        accountId: r.AccountId ? accountMap.get(r.AccountId) : null,
        contactId: r.ContactId ? contactMap.get(r.ContactId) : null,
        subject: r.Subject,
        description: r.Description,
        type: r.Type,
        status: r.Status,
        reason: r.Reason,
        origin: r.Origin,
        priority: r.Priority,
        isClosed: toBool(r.IsClosed),
        closedDate: parseDate(r.ClosedDate),
        isEscalated: toBool(r.IsEscalated),
        closeLimit: parseDate(r.CloseLimit__c),
        feeling: r.feeling__c,
        happeningDate: parseDate(r.HappiningDate__c),
        factoryName: r.FactoryName__c,
        goshitekisya: r.Goshitekisya__c,
        reasonClass: r.ReasonClass__c,
        reasonDetail: r.ReasonDetail__c,
      },
    });
  }
  console.log(`  Done`);
}

async function importTasks() {
  const records = readSfData("Task");
  console.log(`Importing ${records.length} tasks...`);
  for (const r of records) {
    await prisma.sfTask.create({
      data: {
        sfId: r.Id,
        accountId: r.AccountId ? accountMap.get(r.AccountId) : null,
        subject: r.Subject,
        activityDate: parseDate(r.ActivityDate),
        status: r.Status,
        priority: r.Priority,
        description: r.Description,
        companion: r.Companion__c,
        impressions: r.Impressions__c,
        keymanFlag: toBool(r.keyman__c),
        presenFlag: toBool(r.presen__c),
        projectDiscovery: toBool(r.ProjectDiscovery__c),
        spotFlag: toBool(r.SPOT__c),
      },
    });
  }
  console.log(`  Done`);
}

async function importEvents() {
  const records = readSfData("Event");
  console.log(`Importing ${records.length} events...`);
  for (const r of records) {
    await prisma.event.create({
      data: {
        sfId: r.Id,
        accountId: r.AccountId ? accountMap.get(r.AccountId) : null,
        subject: r.Subject,
        location: r.Location,
        isAllDayEvent: toBool(r.IsAllDayEvent),
        startDateTime: parseDate(r.StartDateTime),
        endDateTime: parseDate(r.EndDateTime),
        description: r.Description,
        type: r.Type,
        companion: r.Companion__c,
        impressions: r.Impressions__c,
        keymanFlag: toBool(r.keyman__c),
        presenFlag: toBool(r.presen__c),
        projectDiscovery: toBool(r.ProjectDiscovery__c),
        spotFlag: toBool(r.SPOT__c),
      },
    });
  }
  console.log(`  Done`);
}

async function importMeetings() {
  const records = readSfData("CustomObject_meeting__c");
  console.log(`Importing ${records.length} meetings...`);
  for (const r of records) {
    await prisma.meeting.create({
      data: {
        sfId: r.Id,
        name: r.Name,
        accountId: r.Field3__c ? accountMap.get(r.Field3__c) : null,
        field1: r.Field1__c,
        field2: r.Field2__c,
      },
    });
  }
  console.log(`  Done`);
}

async function importInventoryForecasting() {
  const records = readSfData("InventoryForecasting__c");
  console.log(`Importing ${records.length} inventory forecasting records...`);
  for (const r of records) {
    await prisma.inventoryForecasting.create({
      data: {
        sfId: r.Id,
        name: r.Name,
        centerDeliveryDate: parseDate(r.CenterDeliveryDate__c),
        pieceQuantity: toFloat(r.PieceQuantity__c),
        additionalHarvest: toFloat(r.AdditionalHarvest__c),
        stockAddition: toFloat(r.StockAddition__c),
      },
    });
  }
  console.log(`  Done`);
}

async function importMagistrateMasters() {
  const records = readSfData("MagistrateMaster__c");
  console.log(`Importing ${records.length} magistrate masters...`);
  for (const r of records) {
    await prisma.magistrateMaster.create({
      data: {
        sfId: r.Id,
        name: r.Name,
        accountId: r.CustomerName__c ? accountMap.get(r.CustomerName__c) : null,
        unit: r.Unit__c,
        customerCode: r.CustomerCode__c,
        deliveryCode: r.DeliveryCode__c,
        magistrateId: r.MagistrateID__c,
      },
    });
  }
  console.log(`  Done`);
}

async function importProductMasters() {
  const records = readSfData("ProductMaster__c");
  console.log(`Importing ${records.length} product masters...`);
  for (const r of records) {
    const pm = await prisma.productMaster.create({
      data: {
        sfId: r.Id,
        name: r.Name,
        accountId: r.CustomerName__c ? accountMap.get(r.CustomerName__c) : null,
        productId: r.Product__c ? productMap.get(r.Product__c) : null,
        productCode: r.ProductCode__c,
        unit: r.Unit__c,
        productIdCode: r.ProductID__c,
        unitPrice: toFloat(r.UnitPrice__c),
      },
    });
    productMasterMap.set(r.Id, pm.id);
  }
  console.log(`  Done: ${productMasterMap.size} product masters`);
}

async function importShippingRequests() {
  const records = readSfData("ShippingRequest__c");
  console.log(`Importing ${records.length} shipping requests...`);
  let count = 0;
  for (const r of records) {
    await prisma.shippingRequest.create({
      data: {
        sfId: r.Id,
        name: r.Name,
        accountId: r.AccountName__c ? accountMap.get(r.AccountName__c) : null,
        land: r.Land__c,
        gazette: r.Gazette__c,
        sterilizationTreatment: r.SterilizationTreatment__c,
        packagingMaterial: r.PackagingMaterial__c,
        packing: r.Packing__c,
        unit: r.Unit__c,
        centerDeliveryDate: parseDate(r.CenterDeliveryDate__c),
        classification: r.Classfication__c,
        varietyId: r.Variety__c ? productMap.get(r.Variety__c) : null,
        quantity: toFloat(r.Quantity__c),
        cs: toFloat(r.Cs__c),
        note: r.Note__c,
        pieceConversion: toFloat(r.PieceConversion__c),
        shippingMethod: r.ShippingMethod__c,
        requester: r.Requester__c,
        packingCase: toFloat(r.PackingCase__c),
        expectedShippingDate: parseDate(r.ExpectedShippingDate__c),
        reportId: r.ReportID__c,
        status: r.Status__c,
        productMasterId: r.ProductMaster__c ? productMasterMap.get(r.ProductMaster__c) : null,
        predictQuantity: toFloat(r.PredictQuantity__c),
        unitPrice: toFloat(r.UnitPrice__c),
        salesAmount: toFloat(r.SalesAmount__c),
        productName: r.Product__c,
        pieceConversionPredict: toFloat(r.PieceConversionPredict__c),
      },
    });
    count++;
    if (count % 5000 === 0) console.log(`  ... ${count} shipping requests`);
  }
  console.log(`  Done: ${count} shipping requests`);
}

async function main() {
  console.log("Starting data import from Salesforce exports...\n");

  await importAccounts();
  await importContacts();
  await importProducts();
  await importCampaigns();
  await importOpportunities();
  await importCases();
  await importTasks();
  await importEvents();
  await importMeetings();
  await importInventoryForecasting();
  await importMagistrateMasters();
  await importProductMasters();
  await importShippingRequests();

  console.log("\nImport complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
