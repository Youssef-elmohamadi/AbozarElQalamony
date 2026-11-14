IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Roles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Email] nvarchar(200) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [ProfileImagePath] nvarchar(500) NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261012121243_InitialCreate-roles-users', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
CREATE TABLE [Categories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(300) NOT NULL,
    [Type] int NOT NULL,
    [ParentId] int NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Categories_Categories_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Books] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Author] nvarchar(300) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [CoverImagePath] nvarchar(500) NULL,
    [FilePath] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_Books] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Books_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Lessons] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [MediaPath] nvarchar(500) NULL,
    [Duration] nvarchar(20) NULL,
    [RecordedAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_Lessons] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Lessons_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Sermons] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [MediaPath] nvarchar(500) NULL,
    [Duration] nvarchar(20) NULL,
    [SermonDate] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_Sermons] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Sermons_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Books_CategoryId] ON [Books] ([CategoryId]);

CREATE INDEX [IX_Categories_ParentId] ON [Categories] ([ParentId]);

CREATE INDEX [IX_Categories_Type] ON [Categories] ([Type]);

CREATE INDEX [IX_Categories_Type_ParentId] ON [Categories] ([Type], [ParentId]);

CREATE INDEX [IX_Lessons_CategoryId] ON [Lessons] ([CategoryId]);

CREATE INDEX [IX_Sermons_CategoryId] ON [Sermons] ([CategoryId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013134052_InitialCreate-Categories', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Lessons]') AND [c].[name] = N'Duration');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Lessons] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [Lessons] DROP COLUMN [Duration];

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Lessons]') AND [c].[name] = N'RecordedAt');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Lessons] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [Lessons] DROP COLUMN [RecordedAt];

EXEC sp_rename N'[Lessons].[MediaPath]', N'VideoFilePath', 'COLUMN';

DECLARE @var2 nvarchar(max);
SELECT @var2 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Lessons]') AND [c].[name] = N'Description');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Lessons] DROP CONSTRAINT ' + @var2 + ';');
ALTER TABLE [Lessons] ALTER COLUMN [Description] nvarchar(4000) NULL;

ALTER TABLE [Lessons] ADD [AudioFilePath] nvarchar(500) NULL;

ALTER TABLE [Lessons] ADD [DurationInMinutes] int NULL;

ALTER TABLE [Lessons] ADD [PublishDate] datetime2 NULL;

ALTER TABLE [Lessons] ADD [ThumbnailPath] nvarchar(500) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013160514_InitialCreate-Lessons-Api', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
EXEC sp_rename N'[Books].[FilePath]', N'PdfFilePath', 'COLUMN';

EXEC sp_rename N'[Books].[Author]', N'AuthorName', 'COLUMN';

DECLARE @var3 nvarchar(max);
SELECT @var3 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Books]') AND [c].[name] = N'Description');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Books] DROP CONSTRAINT ' + @var3 + ';');
ALTER TABLE [Books] ALTER COLUMN [Description] nvarchar(4000) NULL;

ALTER TABLE [Books] ADD [PublishDate] datetime2 NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013184729_InitialCreate-Books-Api', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var4 nvarchar(max);
SELECT @var4 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Sermons]') AND [c].[name] = N'Duration');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Sermons] DROP CONSTRAINT ' + @var4 + ';');
ALTER TABLE [Sermons] DROP COLUMN [Duration];

EXEC sp_rename N'[Sermons].[SermonDate]', N'KhutbahDate', 'COLUMN';

EXEC sp_rename N'[Sermons].[MediaPath]', N'VideoFilePath', 'COLUMN';

DECLARE @var5 nvarchar(max);
SELECT @var5 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Sermons]') AND [c].[name] = N'Description');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Sermons] DROP CONSTRAINT ' + @var5 + ';');
ALTER TABLE [Sermons] ALTER COLUMN [Description] nvarchar(4000) NULL;

ALTER TABLE [Sermons] ADD [AudioFilePath] nvarchar(500) NULL;

ALTER TABLE [Sermons] ADD [PublishDate] datetime2 NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013192449_InitialCreate-Sermons-Api', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
CREATE TABLE [SiteAlerts] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SiteAlerts] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_SiteAlerts_IsActive] ON [SiteAlerts] ([IsActive]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261013204337_InitialCreate-SiteAlerts-Api', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [Books] ADD [FileSizeInMB] float NULL;

ALTER TABLE [Books] ADD [PagesCount] int NULL;

ALTER TABLE [Books] ADD [TableOfContentsJson] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261016174713_AddBookReaderFields', N'10.0.12');

COMMIT;
GO

BEGIN TRANSACTION;
CREATE TABLE [Qurans] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Description] nvarchar(4000) NULL,
    [AudioFilePath] nvarchar(500) NULL,
    [VideoFilePath] nvarchar(500) NULL,
    [ThumbnailPath] nvarchar(500) NULL,
    [DurationInMinutes] int NULL,
    [SurahNumber] int NULL,
    [SurahName] nvarchar(200) NULL,
    [PublishDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_Qurans] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Qurans_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Qurans_CategoryId] ON [Qurans] ([CategoryId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261016194129_AddQuranEntity', N'10.0.12');

COMMIT;
GO

