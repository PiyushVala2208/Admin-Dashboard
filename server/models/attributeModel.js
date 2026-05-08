const pool = require("../db");

let hasEnsuredCategoryAttributeColumns = false;
let hasEnsuredAttributeSoftDeleteColumns = false;
let hasEnsuredAttributeRequiredColumn = false;

const tableHasColumn = async (client, tableName, columnName) => {
  const query = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
    LIMIT 1
  `;
  const result = await client.query(query, [tableName, columnName]);
  return result.rowCount > 0;
};

const tableExists = async (client, tableName) => {
  const query = `
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = $1
    LIMIT 1
  `;
  const result = await client.query(query, [tableName]);
  return result.rowCount > 0;
};

const ensureCategoryAttributeColumns = async (client) => {
  if (hasEnsuredCategoryAttributeColumns) return;

  const hasIsRequired = await tableHasColumn(
    client,
    "category_attributes",
    "is_required",
  );
  if (!hasIsRequired) {
    await client.query(
      "ALTER TABLE category_attributes ADD COLUMN is_required boolean NOT NULL DEFAULT false",
    );
  }

  const hasSortOrder = await tableHasColumn(
    client,
    "category_attributes",
    "sort_order",
  );
  if (!hasSortOrder) {
    await client.query(
      "ALTER TABLE category_attributes ADD COLUMN sort_order integer NOT NULL DEFAULT 0",
    );
  }

  hasEnsuredCategoryAttributeColumns = true;
};

const ensureAttributeSoftDeleteColumns = async (client) => {
  if (hasEnsuredAttributeSoftDeleteColumns) return;

  const hasIsActive = await tableHasColumn(client, "attributes", "is_active");
  if (!hasIsActive) {
    await client.query(
      "ALTER TABLE attributes ADD COLUMN is_active boolean NOT NULL DEFAULT true",
    );
  }

  const hasDeletedAt = await tableHasColumn(client, "attributes", "deleted_at");
  if (!hasDeletedAt) {
    await client.query(
      "ALTER TABLE attributes ADD COLUMN deleted_at timestamptz NULL",
    );
  }

  hasEnsuredAttributeSoftDeleteColumns = true;
};

const ensureAttributeRequiredColumn = async (client) => {
  if (hasEnsuredAttributeRequiredColumn) return;

  const hasIsRequired = await tableHasColumn(
    client,
    "attributes",
    "is_required",
  );
  if (!hasIsRequired) {
    await client.query(
      "ALTER TABLE attributes ADD COLUMN is_required boolean NOT NULL DEFAULT false",
    );
  }

  hasEnsuredAttributeRequiredColumn = true;
};

const getDependencyMaps = async (client, attributeIds = []) => {
  const normalizedIds = [...new Set(attributeIds)]
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (normalizedIds.length === 0) {
    return {
      mappedCategoriesMap: new Map(),
      productUsageMap: new Map(),
      variantUsageMap: new Map(),
    };
  }

  const hasCategoryAttributesTable = await tableExists(
    client,
    "category_attributes",
  );
  const mappedCategoriesRes = hasCategoryAttributesTable
    ? await client.query(
        `
          SELECT attribute_id, COUNT(*)::int AS mapped_count
          FROM category_attributes
          WHERE attribute_id = ANY($1::int[])
          GROUP BY attribute_id
        `,
        [normalizedIds],
      )
    : { rows: [] };

  const hasProductAttributeValuesTable = await tableExists(
    client,
    "product_attribute_values",
  );
  const productUsageRes = hasProductAttributeValuesTable
    ? await client.query(
        `
          SELECT attribute_id, COUNT(*)::int AS usage_count
          FROM product_attribute_values
          WHERE attribute_id = ANY($1::int[])
          GROUP BY attribute_id
        `,
        [normalizedIds],
      )
    : { rows: [] };

  const hasVariantAttributesColumn =
    (await tableExists(client, "product_variants")) &&
    (await tableHasColumn(client, "product_variants", "variant_attributes"));
  const variantUsageRes = hasVariantAttributesColumn
    ? await client.query(
        `
          SELECT
            (entry.value->>'attributeId')::int AS attribute_id,
            COUNT(*)::int AS usage_count
          FROM product_variants pv
          CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pv.variant_attributes, '[]'::jsonb)) AS entry(value)
          WHERE
            jsonb_typeof(entry.value) = 'object'
            AND (entry.value->>'attributeId') ~ '^[0-9]+$'
            AND (entry.value->>'attributeId')::int = ANY($1::int[])
          GROUP BY (entry.value->>'attributeId')::int
        `,
        [normalizedIds],
      )
    : { rows: [] };

  const mappedCategoriesMap = new Map(
    mappedCategoriesRes.rows.map((row) => [
      Number(row.attribute_id),
      Number(row.mapped_count),
    ]),
  );
  const productUsageMap = new Map(
    productUsageRes.rows.map((row) => [
      Number(row.attribute_id),
      Number(row.usage_count),
    ]),
  );
  const variantUsageMap = new Map(
    variantUsageRes.rows.map((row) => [
      Number(row.attribute_id),
      Number(row.usage_count),
    ]),
  );

  return {
    mappedCategoriesMap,
    productUsageMap,
    variantUsageMap,
  };
};

const hydrateDependencies = async (client, attributeRows = []) => {
  if (!Array.isArray(attributeRows) || attributeRows.length === 0) return [];

  const attributeIds = attributeRows.map((row) => Number(row.id));
  const { mappedCategoriesMap, productUsageMap, variantUsageMap } =
    await getDependencyMaps(client, attributeIds);

  return attributeRows.map((row) => {
    const mapped_categories_count =
      mappedCategoriesMap.get(Number(row.id)) || 0;
    const product_usage_count = productUsageMap.get(Number(row.id)) || 0;
    const variant_usage_count = variantUsageMap.get(Number(row.id)) || 0;
    const is_in_use =
      mapped_categories_count > 0 ||
      product_usage_count > 0 ||
      variant_usage_count > 0;

    return {
      ...row,
      mapped_categories_count,
      product_usage_count,
      variant_usage_count,
      is_in_use,
    };
  });
};

const Attribute = {
  create: async (name, type, isRequired = false) => {
    await ensureAttributeSoftDeleteColumns(pool);
    await ensureAttributeRequiredColumn(pool);

    const query = `
      INSERT INTO attributes (name, type, is_required, is_active, deleted_at)
      VALUES ($1, $2, $3, true, NULL)
      RETURNING *
    `;
    const value = [name, type, Boolean(isRequired)];
    const { rows } = await pool.query(query, value);
    return rows[0];
  },

  findAll: async () => {
    await ensureAttributeSoftDeleteColumns(pool);
    await ensureAttributeRequiredColumn(pool);

    const query = `
      SELECT
        a.id,
        a.name,
        a.type,
        a.is_required,
        a.created_at,
        COALESCE(
          array_agg(ao.option_value ORDER BY ao.id) FILTER (WHERE ao.id IS NOT NULL),
          '{}'
        ) AS options
      FROM attributes a
      LEFT JOIN attribute_options ao ON ao.attribute_id = a.id
      WHERE a.is_active = true
      GROUP BY a.id
      ORDER BY a.name ASC;
    `;

    const { rows } = await pool.query(query);
    return hydrateDependencies(pool, rows);
  },

  findById: async (id, client) => {
    const executor = client || pool;
    await ensureAttributeSoftDeleteColumns(executor);
    await ensureAttributeRequiredColumn(executor);

    const query = `
      SELECT
        a.id,
        a.name,
        a.type,
        a.is_required,
        a.created_at,
        COALESCE(
          array_agg(ao.option_value ORDER BY ao.id) FILTER (WHERE ao.id IS NOT NULL),
          '{}'
        ) AS options
      FROM attributes a
      LEFT JOIN attribute_options ao ON ao.attribute_id = a.id
      WHERE a.id = $1 AND a.is_active = true
      GROUP BY a.id
      LIMIT 1;
    `;

    const { rows } = await executor.query(query, [id]);
    if (!rows[0]) return null;
    const [hydrated] = await hydrateDependencies(executor, [rows[0]]);
    return hydrated || null;
  },

  addOptions: async (attributeId, options) => {
    if (!Array.isArray(options) || options.length === 0) {
      return [];
    }

    const normalizedOptions = [
      ...new Set(
        options.map((value) => String(value || "").trim()).filter(Boolean),
      ),
    ];

    if (normalizedOptions.length === 0) {
      return [];
    }

    const query = `
      INSERT INTO attribute_options (attribute_id, option_value)
      SELECT $1, unnest($2::varchar[])
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [attributeId, normalizedOptions]);
    return rows;
  },

  mapToCategory: async (categoryId, attributeId, isRequired = false) => {
    await ensureCategoryAttributeColumns(pool);

    const query = `
      INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
      SELECT $1, $2, $3, $4
      WHERE NOT EXISTS (
        SELECT 1
        FROM category_attributes
        WHERE category_id = $1 AND attribute_id = $2
      )
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      categoryId,
      attributeId,
      isRequired,
      0,
    ]);
    return rows[0];
  },

  findByCategory: async (categoryId) => {
    await ensureCategoryAttributeColumns(pool);
    await ensureAttributeSoftDeleteColumns(pool);
    await ensureAttributeRequiredColumn(pool);

    const query = `
      SELECT 
        a.id, 
        a.name, 
        a.type, 
        a.is_required AS attribute_is_required,
        (a.is_required OR ca.is_required) AS is_required,
        ca.sort_order,
        COALESCE(
          array_agg(ao.option_value ORDER BY ao.id) FILTER (WHERE ao.id IS NOT NULL),
          '{}'
        ) AS options
      FROM attributes a
      JOIN category_attributes ca ON a.id = ca.attribute_id
      LEFT JOIN attribute_options ao ON a.id = ao.attribute_id
      WHERE ca.category_id = $1
      AND a.is_active = true
      GROUP BY a.id, ca.is_required, ca.sort_order
      ORDER BY ca.sort_order ASC, a.name ASC;
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return rows;
  },

  syncCategoryAttributes: async (categoryId, mappings) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await ensureCategoryAttributeColumns(client);

      await client.query(
        "DELETE FROM category_attributes WHERE category_id = $1",
        [categoryId],
      );

      if (Array.isArray(mappings) && mappings.length > 0) {
        const dedupedMappings = new Map();
        mappings.forEach((item, index) => {
          const isObjectItem =
            item !== null && typeof item === "object" && !Array.isArray(item);

          const attributeId = Number.parseInt(
            isObjectItem ? item.attributeId : item,
            10,
          );
          const isRequired = Boolean(
            isObjectItem ? item.is_required || item.isRequired : false,
          );
          const sortOrder = Number.parseInt(
            isObjectItem ? (item.sort_order ?? item.sortOrder) : index,
            10,
          );

          if (!Number.isInteger(attributeId) || attributeId <= 0) {
            return;
          }

          dedupedMappings.set(attributeId, {
            attribute_id: attributeId,
            is_required: isRequired,
            sort_order: Number.isInteger(sortOrder) ? sortOrder : index,
          });
        });

        const normalizedMappings = Array.from(dedupedMappings.values());

        if (normalizedMappings.length === 0) {
          await client.query("COMMIT");
          return { success: true };
        }

        const mappingPayload = JSON.stringify(normalizedMappings);

        const insertQuery = `
          INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
          SELECT $1, data.attribute_id, data.is_required, data.sort_order
          FROM json_to_recordset($2::json) AS data(
            attribute_id int,
            is_required boolean,
            sort_order int
          )
          INNER JOIN attributes a ON a.id = data.attribute_id
        `;
        await client.query(insertQuery, [categoryId, mappingPayload]);
      }

      await client.query("COMMIT");
      return { success: true };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  replaceOptions: async (attributeId, options, client) => {
    const executor = client || pool;

    await executor.query(
      "DELETE FROM attribute_options WHERE attribute_id = $1",
      [attributeId],
    );

    if (!Array.isArray(options) || options.length === 0) {
      return;
    }

    const normalizedOptions = [
      ...new Set(
        options.map((value) => String(value || "").trim()).filter(Boolean),
      ),
    ];

    if (normalizedOptions.length === 0) {
      return;
    }

    await executor.query(
      `
        INSERT INTO attribute_options (attribute_id, option_value)
        SELECT $1, unnest($2::varchar[])
      `,
      [attributeId, normalizedOptions],
    );
  },

  getDependencySummary: async (attributeId, client) => {
    const executor = client || pool;
    const normalizedId = Number.parseInt(attributeId, 10);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      return {
        mapped_categories_count: 0,
        product_usage_count: 0,
        variant_usage_count: 0,
        is_in_use: false,
      };
    }

    const { mappedCategoriesMap, productUsageMap, variantUsageMap } =
      await getDependencyMaps(executor, [normalizedId]);

    const mapped_categories_count = mappedCategoriesMap.get(normalizedId) || 0;
    const product_usage_count = productUsageMap.get(normalizedId) || 0;
    const variant_usage_count = variantUsageMap.get(normalizedId) || 0;

    return {
      mapped_categories_count,
      product_usage_count,
      variant_usage_count,
      is_in_use:
        mapped_categories_count > 0 ||
        product_usage_count > 0 ||
        variant_usage_count > 0,
    };
  },

  getDependencyImpactReport: async (attributeId, client) => {
    const executor = client || pool;
    const normalizedId = Number.parseInt(attributeId, 10);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      return {
        mapped_categories_count: 0,
        product_usage_count: 0,
        variant_usage_count: 0,
        total_usage_count: 0,
        mapped_categories: [],
        product_spec_usage: [],
        product_variant_usage: [],
      };
    }

    const hasCategoryAttributesTable = await tableExists(
      executor,
      "category_attributes",
    );
    const hasProductAttributeValuesTable = await tableExists(
      executor,
      "product_attribute_values",
    );
    const hasInventoryTable = await tableExists(executor, "inventory");
    const hasProductVariantsTable = await tableExists(
      executor,
      "product_variants",
    );
    const hasVariantAttributesColumn =
      hasProductVariantsTable &&
      (await tableHasColumn(
        executor,
        "product_variants",
        "variant_attributes",
      ));

    const categoryRows = hasCategoryAttributesTable
      ? (
          await executor.query(
            `
              SELECT DISTINCT c.id, c.name, c.slug
              FROM category_attributes ca
              INNER JOIN categories c ON c.id = ca.category_id
              WHERE ca.attribute_id = $1
              ORDER BY c.name ASC
            `,
            [normalizedId],
          )
        ).rows
      : [];

    const productSpecRows =
      hasProductAttributeValuesTable && hasInventoryTable
        ? (
            await executor.query(
              `
              SELECT DISTINCT i.id, i.name, i.category
              FROM product_attribute_values pav
              INNER JOIN inventory i ON i.id = pav.product_id
              WHERE pav.attribute_id = $1
              ORDER BY i.id DESC
              LIMIT 50
            `,
              [normalizedId],
            )
          ).rows
        : [];

    const productVariantRows =
      hasVariantAttributesColumn && hasInventoryTable
        ? (
            await executor.query(
              `
              SELECT
                i.id,
                i.name,
                i.category,
                COUNT(*)::int AS matched_variants
              FROM product_variants pv
              INNER JOIN inventory i ON i.id = pv.product_id
              CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pv.variant_attributes, '[]'::jsonb)) AS entry(value)
              WHERE
                jsonb_typeof(entry.value) = 'object'
                AND (entry.value->>'attributeId') ~ '^[0-9]+$'
                AND (entry.value->>'attributeId')::int = $1
              GROUP BY i.id, i.name, i.category
              ORDER BY i.id DESC
              LIMIT 50
            `,
              [normalizedId],
            )
          ).rows
        : [];

    const dependencies = await Attribute.getDependencySummary(
      normalizedId,
      executor,
    );

    return {
      ...dependencies,
      total_usage_count:
        Number(dependencies.mapped_categories_count || 0) +
        Number(dependencies.product_usage_count || 0) +
        Number(dependencies.variant_usage_count || 0),
      mapped_categories: categoryRows,
      product_spec_usage: productSpecRows,
      product_variant_usage: productVariantRows,
    };
  },

  updateById: async (attributeId, updates, client) => {
    const executor = client || pool;
    await ensureAttributeRequiredColumn(executor);
    const query = `
      UPDATE attributes
      SET name = $1, type = $2, is_required = $3
      WHERE id = $4 AND is_active = true
      RETURNING *
    `;
    const { rows } = await executor.query(query, [
      updates.name,
      updates.type,
      Boolean(updates.is_required),
      attributeId,
    ]);
    return rows[0] || null;
  },

  removeMappings: async (attributeId, client) => {
    const executor = client || pool;
    await ensureCategoryAttributeColumns(executor);
    await executor.query(
      "DELETE FROM category_attributes WHERE attribute_id = $1",
      [attributeId],
    );
  },

  softDeleteById: async (attributeId, client) => {
    const executor = client || pool;
    await ensureAttributeSoftDeleteColumns(executor);
    const query = `
      UPDATE attributes
      SET is_active = false, deleted_at = NOW()
      WHERE id = $1 AND is_active = true
      RETURNING id
    `;
    const { rows } = await executor.query(query, [attributeId]);
    return rows[0] || null;
  },

  hardDeleteById: async (attributeId, client) => {
    const executor = client || pool;
    const hasOptionsTable = await tableExists(executor, "attribute_options");

    if (hasOptionsTable) {
      await executor.query(
        "DELETE FROM attribute_options WHERE attribute_id = $1",
        [attributeId],
      );
    }

    const { rows } = await executor.query(
      "DELETE FROM attributes WHERE id = $1 RETURNING id",
      [attributeId],
    );
    return rows[0] || null;
  },
};

module.exports = Attribute;
