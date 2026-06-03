#!/bin/bash
# Rename JiaOS to Novelix

FILES=$(grep -rl "jiaos\|JiaOS\|@actalk/jiaos" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.yml" packages/ .github/ package.json pnpm-workspace.yaml tsconfig.json 2>/dev/null | grep -v node_modules | grep -v dist | grep -v ".meta-kim" | sort)

for file in $FILES; do
  echo "  $file"
  sed -i '' 's|@actalk/jiaos-core|@actalk/novelix-core|g' "$file"
  sed -i '' 's|@actalk/jiaos-studio|@actalk/novelix-studio|g' "$file"
  sed -i '' 's|@actalk/jiaos|@actalk/novelix|g' "$file"
  sed -i '' 's/JIAOS_LLM/NOVELIX_LLM/g' "$file"
  sed -i '' 's/JIAOS_STUDIO/NOVELIX_STUDIO/g' "$file"
  sed -i '' 's/JIAOS_DAEMON/NOVELIX_DAEMON/g' "$file"
  sed -i '' 's/JIAOS_TELEGRAM/NOVELIX_TELEGRAM/g' "$file"
  sed -i '' 's/JIAOS_FEISHU/NOVELIX_FEISHU/g' "$file"
  sed -i '' 's/JIAOS_WECOM/NOVELIX_WECOM/g' "$file"
  sed -i '' 's/JIAOS_DEFAULT/NOVELIX_DEFAULT/g' "$file"
  sed -i '' 's/JIAOS_PROJECT/NOVELIX_PROJECT/g' "$file"
  sed -i '' 's|\.jiaos/|.novelix/|g' "$file"
  sed -i '' 's|jiaos\.json|novelix.json|g' "$file"
  sed -i '' 's|jiaos\.log|novelix.log|g' "$file"
  sed -i '' 's/\bJiaOS\b/Novelix/g' "$file"
  sed -i '' 's/"jiaos"/"novelix"/g' "$file'
  sed -i '' "s/'jiaos'/'novelix'/g" "$file"
  sed -i '' 's/`jiaos`/`novelix`/g' "$file"
done

echo "Done"
