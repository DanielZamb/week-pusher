function doGet(e) {
  var Template = HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Proyecto APU")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return Template;
}

const db = gasDB.init(
  "week-pusher-db",
  "1lZD4Z0n1CMytII1X66lTBBh7zxIPDlg8JW7XLRm07K0"
);

const categoryTableConfig = {
  tableName: "CATEGORY",
  historyTableName: "DELETED_CATEGORY",
  fields: {
    created_at: "date",
    name: "string",
    color: "string",
  },
};

const calendarSyncTableConfig = {
  tableName: "CALENDAR_SYNC",
  historyTableName: "DELETED_CALENDAR_SYNC",
  fields: {
    created_at: "date",
    template_id: "number",
    google_calendar_id: "string",
    synced_at: "date",
    sync_status: "boolean",
    errorMessage: "string",
  },
};

const dayScheduleTableConfig = {
  tableName: "DAY_SCHEDULE",
  historyTableName: "DELETED_DAY_SCHEDULE",
  fields: {
    created_at: "date",
    template_id: "number",
    day_of_week: "number",
    total_minutes: "number",
  },
};

const weekTemplateTableConfig = {
  tableName: "WEEK_TEMPLATE",
  historyTableName: "DELETED_WEEK_TEMPLATE",
  fields: {
    created_at: "date",
    user_id: "number",
    name: "string",
    is_active: "string",
  },
};

const userTableConfig = {
  tableName: "USER",
  historyTableName: "DELETED_USER",
  fields: {
    created_at: "date",
    email: "string",
    name: "string",
    password: "string",
    last_sync: "date",
  },
};

function createSchema() {
  console.log(db.createTable(categoryTableConfig));
  console.log(db.createTable(calendarSyncTableConfig));
  console.log(db.createTable(dayScheduleTableConfig));
  console.log(db.createTable(weekTemplateTableConfig));
  console.log(db.createTable(userTableConfig));
}

function createJunctionTables() {
  console.log(db.createTable(activityTableConfig));
}

console.log(db.putTableIntoDbContext(categoryTableConfig));
console.log(db.putTableIntoDbContext(calendarSyncTableConfig));
console.log(db.putTableIntoDbContext(dayScheduleTableConfig));
console.log(db.putTableIntoDbContext(weekTemplateTableConfig));
console.log(db.putTableIntoDbContext(userTableConfig));

const activityTableConfig = db.createManyToManyTableConfig({
  entity1TableName: dayScheduleTableConfig.tableName,
  entity2TableName: categoryTableConfig.tableName,
  fields: {
    created_at: "date",
    name: "string",
    start_time: "date",
    end_time: "date",
    duration_minutes: "number",
    is_completed: "boolean",
  },
}).data;

console.log(db.putTableIntoDbContext(activityTableConfig));

/**
 * CRUD USERS
 */

function createUser(newUser) {
  newUser.created_at = new Date(newUser.created_at);
  const response = db.create(
    userTableConfig.tableName,
    newUser,
    Object.keys(userTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function updateUser(updatedUser, id) {
  updatedUser.created_at = new Date(updatedUser.created_at);
  const response = db.update(
    userTableConfig.tableName,
    id,
    updatedUser,
    Object.keys(userTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function readUser(id) {
  const response = db.read(userTableConfig.tableName, id);
  console.log(response);
  return JSON.stringify(response);
}

function deleteUser(id) {
  const response = db.remove(
    userTableConfig.tableName,
    userTableConfig.historyTableName,
    id
  );
  console.log(response);
  return JSON.stringify(response);
}

function getAllUsers() {
  const response = db.getAll(
    userTableConfig.tableName,
    (options = {}),
    (useCache = false)
  );
  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

function registerUser(email, name, password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  const hashedPassword = Utilities.newBlob(digest).getDataAsString();
  const user = {
    email: email,
    name: name,
    password: hashedPassword,
    created_at: new Date(),
    last_sync: new Date(),
  };

  console.log(user);
  return createUser(user);
}

// registerUser('hola@email', 'misbolas', 'ddddddddddddd')

function loginUser(email, password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  const hashedPassword = Utilities.newBlob(digest).getDataAsString();

  const response = db
    .getAll(userTableConfig.tableName, {}, false)
    .data.filter(
      (user) => user.email === email && user.password === hashedPassword
    );

  console.log(response);

  if (response && response.length > 0) {
    return JSON.stringify(response[0]);
  } else {
    return JSON.stringify({ error: "User not found", status: 401 });
  }
}

function getAllUserWeekTemplates(userId) {
  const response = db.getRelatedRecords(
    (foreignKey = userId),
    (tableName = weekTemplateTableConfig.tableName),
    (field = "user_id"),
    (fieldIndex = 3),
    (options = {}),
    (useCache = false)
  );

  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

// loginUser("hola@email", "dddddddddddd1");
/**
 * CRUD WEEK TEMPLATES
 */

function createWeekTemplate(newWeekTemplate) {
  newWeekTemplate.created_at = new Date(newWeekTemplate.created_at);
  const response = db.create(
    weekTemplateTableConfig.tableName,
    newWeekTemplate,
    Object.keys(weekTemplateTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function updateWeekTemplate(updatedWeekTemplate, id) {
  updatedWeekTemplate.created_at = new Date(updatedWeekTemplate.created_at);
  const response = db.update(
    weekTemplateTableConfig.tableName,
    id,
    updatedWeekTemplate,
    Object.keys(weekTemplateTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function readWeekTemplate(id) {
  const response = db.read(weekTemplateTableConfig.tableName, id);
  console.log(response);
  return JSON.stringify(response);
}

function deleteWeekTemplate(id) {
  const response = db.remove(
    weekTemplateTableConfig.tableName,
    weekTemplateTableConfig.historyTableName,
    id
  );
  console.log(response);
  return JSON.stringify(response);
}

function getAllWeekTemplates() {
  const response = db.getAll(
    weekTemplateTableConfig.tableName,
    (options = {}),
    (useCache = false)
  );
  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

function getCalendarSyncsByTemplateId(templateId) {
  const response = db.getRelatedRecords(
    (foreignKey = templateId),
    (tableName = calendarSyncTableConfig.tableName),
    (field = "template_id"),
    (fieldIndex = 3),
    (options = {}),
    (useCache = false)
  );

  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

function getDaySchedulesByTemplateId(templateId) {
  const response = db.getRelatedRecords(
    (foreignKey = templateId),
    (tableName = dayScheduleTableConfig.tableName),
    (field = "template_id"),
    (fieldIndex = 3),
    (options = {}),
    (useCache = false)
  );

  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

/**
 * CRUD DAY SCHEDULES
 */

function createDaySchedule(newDaySchedule) {
  newDaySchedule.created_at = new Date(newDaySchedule.created_at);
  const response = db.create(
    dayScheduleTableConfig.tableName,
    newDaySchedule,
    Object.keys(dayScheduleTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function updateDaySchedule(updatedDaySchedule, id) {
  updatedDaySchedule.created_at = new Date(updatedDaySchedule.created_at);
  const response = db.update(
    dayScheduleTableConfig.tableName,
    id,
    updatedDaySchedule,
    Object.keys(dayScheduleTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function readDaySchedule(id) {
  const response = db.read(dayScheduleTableConfig.tableName, id);
  console.log(response);
  return JSON.stringify(response);
}

function deleteDaySchedule(id) {
  const response = db.removeWithCascade(
    dayScheduleTableConfig.tableName,
    dayScheduleTableConfig.historyTableName,
    id
  );
  console.log(response);
  return JSON.stringify(response);
}

function getAllDaySchedules() {
  const response = db.getAll(
    dayScheduleTableConfig.tableName,
    (options = {}),
    (useCache = false)
  );
  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

/**
 * CRUD CATEGORIES
 */

function createCategory(newCategory) {
  newCategory.created_at = new Date(newCategory.created_at);
  const response = db.create(
    categoryTableConfig.tableName,
    newCategory,
    Object.keys(categoryTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function updateCategory(updatedCategory, id) {
  updatedCategory.created_at = new Date(updatedCategory.created_at);
  const response = db.update(
    categoryTableConfig.tableName,
    id,
    updatedCategory,
    Object.keys(categoryTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function readCategory(id) {
  const response = db.read(categoryTableConfig.tableName, id);
  console.log(response);
  return JSON.stringify(response);
}

function deleteCategory(id) {
  const response = db.removeWithCascade(
    categoryTableConfig.tableName,
    categoryTableConfig.historyTableName,
    id
  );
  console.log(response);
  return JSON.stringify(response);
}

function getAllCategories() {
  const response = db.getAll(
    categoryTableConfig.tableName,
    (options = {}),
    (useCache = false)
  );
  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

/**
 * CRUD ACTIVITIES
 */

function createActivity(newActivity) {
  newActivity.created_at = new Date(newActivity.created_at);
  const response = db.create(
    activityTableConfig.tableName,
    newActivity,
    Object.keys(activityTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function updateActivity(updatedActivity, id) {
  updatedActivity.created_at = new Date(updatedActivity.created_at);
  const response = db.response(
    activityTableConfig.tableName,
    id,
    updatedActivity,
    Object.keys(activityTableConfig.fields)
  );

  console.log(response);
  return JSON.stringify(response);
}

function readActivity(id) {
  const response = db.read(activityTableConfig.tableName, id);
  console.log(response);
  return JSON.stringify(response);
}

function deleteActivity(id) {
  const response = db.remove(
    activityTableConfig.tableName,
    activityTableConfig.historyTableName,
    id
  );
  console.log(response);
  return JSON.stringify(response);
}

function getAllActivities() {
  const response = db.getAll(
    activityTableConfig.tableName,
    (options = {}),
    (useCache = false)
  );
  console.log(response.status);
  console.log(response.data.length);
  console.log(response.data[0]);

  return JSON.stringify(response);
}

function readActivityFromDaySchedule(dayScheduleId) {
  const response = db.getJunctionRecords(
    (junctionTableName = activityTableConfig.tableName),
    (sourceTableName = dayScheduleTableConfig.tableName),
    (targetTableName = categoryTableConfig.tableName),
    (sourceId = dayScheduleId),
    (options = {})
  );

  console.log(response.status);
  console.log(response.message);
  console.log(response.metadata);

  for (record of response.data) {
    console.log(record);
  }

  return JSON.stringify(response);
}

function readActivityFromCategory(categoryId) {
  const response = db.getJunctionRecords(
    (junctionTableName = activityTableConfig.tableName),
    (sourceTableName = categoryTableConfig.tableName),
    (targetTableName = dayScheduleTableConfig.tableName),
    (sourceId = categoryId),
    (options = {})
  );

  console.log(response.status);
  console.log(response.message);
  console.log(response.metadata);

  for (record of response.data) {
    console.log(record);
  }

  return JSON.stringify(response);
}
