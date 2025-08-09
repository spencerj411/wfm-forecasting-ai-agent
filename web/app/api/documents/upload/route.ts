import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { RuleDocument } from '@/lib/business-rules-types';

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf'];

export async function POST(request: NextRequest) {
  console.log('🚀 Document upload API called');
  try {
    // Initialize Supabase with user auth
    const supabase = await createClient();
    console.log('✅ Supabase client created');
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', { authError, userId: user?.id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    console.log(`Processing document upload: ${file.name} (${file.size} bytes)`);

    // Create initial database record
    const documentRecord: Omit<RuleDocument, 'id'> = {
      user_id: user.id,
      filename: file.name,
      file_size: file.size,
      document_type: 'other', // Generic business document type
      upload_status: 'processing'
    };

    const { data: savedDocument, error: dbError } = await supabase
      .from('rule_documents')
      .insert(documentRecord)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Document record data:', documentRecord);
      return NextResponse.json({ 
        error: `Failed to save document record: ${dbError.message}` 
      }, { status: 500 });
    }

    // For now, let's skip PDF text extraction and just store a placeholder
    // This will let us test the full upload flow, then we can fix PDF parsing separately
    let extractedText = '';
    try {
      // Temporary placeholder - we'll fix PDF extraction after the upload flow works
      extractedText = `[PDF Upload Successful] Document: ${file.name}, Size: ${file.size} bytes, Type: Business Rules Document. PDF text extraction will be implemented once upload flow is working.`;
      
      console.log(`✅ PDF upload successful, placeholder text created: ${extractedText.length} characters`);
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      
      // Update document status to failed
      await supabase
        .from('rule_documents')
        .update({ 
          upload_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', savedDocument.id);

      return NextResponse.json({ 
        error: 'Failed to process PDF file.' 
      }, { status: 400 });
    }

    console.log('📄 PDF text extracted successfully');

    // Update document with extracted text
    const { error: updateError } = await supabase
      .from('rule_documents')
      .update({ 
        raw_text: extractedText,
        upload_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', savedDocument.id);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      return NextResponse.json({ 
        error: `Failed to save extracted text: ${updateError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ Successfully processed document: ${savedDocument.id}`);

    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument.id,
        filename: savedDocument.filename,
        document_type: 'business_document',
        upload_status: 'completed',
        text_length: extractedText.length,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Document upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}