import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialMigration1703510400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'last_name',
            type: 'varchar',
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'admin'],
            default: "'user'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    // Create events table
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'timestamp with time zone',
          },
          {
            name: 'end_date',
            type: 'timestamp with time zone',
          },
          {
            name: 'location',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'capacity',
            type: 'integer',
          },
          {
            name: 'available_tickets',
            type: 'integer',
            default: 0,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'ARS'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    // Create tickets table
    await queryRunner.createTable(
      new Table({
        name: 'tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'event_id',
            type: 'uuid',
          },
          {
            name: 'customer_name',
            type: 'varchar',
          },
          {
            name: 'customer_email',
            type: 'varchar',
          },
          {
            name: 'customer_dni',
            type: 'varchar',
          },
          {
            name: 'customer_phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 1,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'ARS'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'used', 'cancelled', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'qr_code',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'qr_validated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'purchase_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'used_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['event_id'],
            referencedTableName: 'events',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'ticket_id',
            type: 'uuid',
          },
          {
            name: 'mercadopago_payment_id',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'mercadopago_preference_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'mercadopago_merchant_order_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'ARS'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_method_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payer_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payer_identification_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payer_identification_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['ticket_id'],
            referencedTableName: 'tickets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
    await queryRunner.dropTable('tickets');
    await queryRunner.dropTable('events');
    await queryRunner.dropTable('users');
  }
}

